import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 1: Schema Detection Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify column data type from a sample of values.
 * Returns: 'numeric' | 'date' | 'categorical' | 'id' | 'text'
 */
function classifyColumn(values, colName) {
    const nonEmpty = values.filter(v => v !== null && v !== undefined && v !== '');
    if (nonEmpty.length === 0) return 'text';

    const colLower = colName.toLowerCase().trim();

    // ID columns — never treat as numeric even if they are numbers
    const idKeywords = ['id', 'code', 'sku', 'ref', 'no.', 'num', 'number', 'productid', 'orderid', 'customerid'];
    if (idKeywords.some(k => colLower === k || colLower.endsWith('id') || colLower.endsWith('code'))) {
        return 'id';
    }

    // Date detection
    const dateParseable = nonEmpty.filter(v => {
        const d = new Date(v);
        return !isNaN(d) && isNaN(Number(v));
    });
    if (dateParseable.length / nonEmpty.length > 0.7) return 'date';

    // Numeric detection
    const numericCount = nonEmpty.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).length;
    if (numericCount / nonEmpty.length > 0.8) {
        // Low cardinality numeric might still be categorical (e.g. Year: 2020, 2021)
        const unique = new Set(nonEmpty.map(v => String(v))).size;
        if (unique <= 8 && nonEmpty.length > 8) return 'categorical';
        return 'numeric';
    }

    // Categorical: few unique string values
    const unique = new Set(nonEmpty.map(v => String(v).toLowerCase().trim())).size;
    if (unique <= Math.min(20, nonEmpty.length * 0.4) && nonEmpty.length > 1) {
        return 'categorical';
    }

    return 'text';
}

/**
 * Detect the overall schema structure from the column classification map.
 * Returns: 'product_table' | 'time_series' | 'kpi_summary' | 'grouped_data' | 'raw_table'
 */
function detectSchemaType(schema) {
    const types = Object.values(schema).map(c => c.type);
    const hasDate = types.includes('date');
    const hasNumeric = types.includes('numeric');
    const hasCategorical = types.includes('categorical');
    const hasText = types.includes('text') || types.includes('id');
    const numericCount = types.filter(t => t === 'numeric').length;

    if (hasDate && hasNumeric) return 'time_series';
    if (hasText && hasNumeric && hasCategorical) return 'product_table';
    if (hasText && hasNumeric) return 'product_table';
    if (hasCategorical && hasNumeric) return 'grouped_data';
    if (numericCount >= 3 && !hasText) return 'kpi_summary';
    return 'raw_table';
}

/**
 * Aggregate numeric values for chart generation.
 */
function aggregateByGroup(rows, labelCol, groupCol, numericCols) {
    if (!labelCol && !groupCol) return [];

    // Group by category if exists
    if (groupCol) {
        const groups = {};
        rows.forEach(row => {
            const g = String(row[groupCol] ?? 'Other').trim();
            if (!groups[g]) groups[g] = { name: g };
            numericCols.forEach(col => {
                if (!groups[g][col]) groups[g][col] = 0;
                const val = parseFloat(row[col]);
                if (!isNaN(val)) groups[g][col] += val;
            });
        });
        return Object.values(groups);
    }

    // Otherwise use label column (one row per label item)
    return rows.map(row => {
        const entry = { name: String(row[labelCol] ?? '').trim() };
        numericCols.forEach(col => {
            const val = parseFloat(row[col]);
            entry[col] = isNaN(val) ? 0 : val;
        });
        return entry;
    }).filter(e => e.name);
}

// ─────────────────────────────────────────────────────────────────────────────
// PHASE 2: Metric Derivation (legacy fixed-key extraction, enhanced)
// ─────────────────────────────────────────────────────────────────────────────

function deriveLegacyMetrics(jsonData) {
    const metrics = {};

    const findValue = (row, ...aliases) => {
        const keys = Object.keys(row);
        for (const alias of aliases) {
            const target = alias.toLowerCase().trim();
            const matchedKey = keys.find(k => k.toLowerCase().trim() === target);
            if (matchedKey !== undefined) {
                const val = parseFloat(row[matchedKey]);
                if (!isNaN(val)) return val;
            }
        }
        return null;
    };

    jsonData.forEach(row => {
        // Scenario A: Row-based Key-Value (template style: Metric | Value)
        const rawKey = String(
            row['Metric'] ?? row['metric'] ?? row['key'] ?? row['category'] ?? ''
        ).toLowerCase().trim();

        const valueRaw =
            row['Value'] !== undefined ? row['Value'] :
                row['value'] !== undefined ? row['value'] :
                    row['amount'] !== undefined ? row['amount'] : null;

        const rawVal = valueRaw !== null ? parseFloat(valueRaw) : NaN;

        const mapKV = (targetKey, aliasList) => {
            if (rawKey && aliasList.some(a => rawKey.includes(a.toLowerCase()))) {
                if (!isNaN(rawVal)) metrics[targetKey] = rawVal;
            }
        };

        if (rawKey) {
            mapKV('revenue', ['revenue', 'sales', 'turnover', 'gmv', 'mrr', 'arr']);
            mapKV('orders', ['order', 'transaction', 'signup', 'units produced']);
            mapKV('refunds', ['refund', 'return', 'churn', 'reject']);
            mapKV('openTickets', ['open ticket', 'active ticket', 'open_ticket', 'complaint']);
            mapKV('resolvedTickets', ['resolved ticket', 'closed ticket', 'resolved_ticket']);
            mapKV('avgResponse', ['response time', 'avg response', 'response_time', 'avgresponse']);
            mapKV('inflow', ['inflow', 'money in', 'cash in', 'cash_in', 'subscription revenue']);
            mapKV('outflow', ['outflow', 'money out', 'cash out', 'cash_out', 'infrastructure', 'production cost']);
        }

        // Scenario B: Column-based (headers are metric names)
        const kpiMappings = [
            ['revenue', ['Revenue', 'Sales', 'Total Revenue', 'Turnover', 'GMV', 'MRR', 'ARR', 'Total Sales']],
            ['orders', ['Orders', 'Total Orders', 'Order Count', 'Units', 'Signups', 'New Signups']],
            ['refunds', ['Refunds', 'Total Refunds', 'Returns', 'Churn', 'Churned']],
            ['openTickets', ['Open Tickets', 'Tickets', 'Active Tickets', 'Open_Tickets', 'Complaints']],
            ['resolvedTickets', ['Resolved Tickets', 'Resolved', 'Closed Tickets', 'Resolved_Tickets']],
            ['avgResponse', ['Response Time', 'Avg Response', 'Response', 'Avg_Response']],
            ['inflow', ['Inflow', 'Cash In', 'Money In', 'Cash_In']],
            ['outflow', ['Outflow', 'Cash Out', 'Money Out', 'Cash_Out']],
        ];

        kpiMappings.forEach(([key, aliases]) => {
            const val = findValue(row, ...aliases);
            if (val !== null) {
                if (key === 'orders' || key === 'refunds' || key === 'openTickets' || key === 'resolvedTickets') {
                    metrics[key] = Math.floor(val);
                } else {
                    metrics[key] = val;
                }
            }
        });
    });

    return metrics;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: parseMetricsExcel
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses an Excel (.xlsx/.xls) or CSV file with intelligent schema detection.
 *
 * Returns:
 * {
 *   metrics     – legacy KPI object (revenue, orders, etc.) for dashboard compatibility
 *   headers     – raw column header strings
 *   rawTable    – array of all row objects
 *   summary     – { totalRows, numericCols, textCols, categoricalCols, schemaType }
 *   chartData   – array of chart-ready data objects  
 *   schemaInfo  – { columns: {colName: {type, min, max, avg, unique}}, schemaType, labelCol, groupCol, numericCols }
 * }
 */
export const parseMetricsExcel = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const isCsv = file.name.toLowerCase().endsWith('.csv');

        reader.onload = (e) => {
            try {
                let workbook;
                if (isCsv) {
                    const text = e.target.result;
                    workbook = XLSX.read(text, { type: 'string' });
                } else {
                    const data = new Uint8Array(e.target.result);
                    workbook = XLSX.read(data, { type: 'array' });
                }

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (jsonData.length === 0) {
                    reject(new Error('The file appears to be empty or has no data rows.'));
                    return;
                }

                const allHeaders = Object.keys(jsonData[0]);

                // ── Phase 1: Classify every column ───────────────────────────
                const schema = {};
                allHeaders.forEach(col => {
                    const values = jsonData.map(r => r[col]);
                    const type = classifyColumn(values, col);

                    const numericVals = values
                        .map(v => parseFloat(v))
                        .filter(v => !isNaN(v));

                    schema[col] = {
                        type,
                        count: values.filter(v => v !== '' && v !== null).length,
                        unique: new Set(values.map(v => String(v).toLowerCase().trim())).size,
                        min: numericVals.length ? Math.min(...numericVals) : null,
                        max: numericVals.length ? Math.max(...numericVals) : null,
                        avg: numericVals.length
                            ? Math.round((numericVals.reduce((a, b) => a + b, 0) / numericVals.length) * 100) / 100
                            : null,
                        sum: numericVals.length
                            ? Math.round(numericVals.reduce((a, b) => a + b, 0) * 100) / 100
                            : null,
                    };
                });

                const schemaType = detectSchemaType(schema);

                // Find key structural columns
                const numericCols = allHeaders.filter(h => schema[h].type === 'numeric');
                const textCols = allHeaders.filter(h => schema[h].type === 'text' || schema[h].type === 'id');
                const categoricalCols = allHeaders.filter(h => schema[h].type === 'categorical');
                const dateCols = allHeaders.filter(h => schema[h].type === 'date');

                // Primary label column = first text/id col (Name, ProductID, etc.)
                const labelCol = textCols[0] || categoricalCols[0] || null;
                // Primary group column = first categorical col (Category, Department, etc.)
                const groupCol = categoricalCols[0] || null;

                // ── Phase 2: Generate chart data ──────────────────────────────
                // For time series: group numeric by date
                let chartData = [];
                if (schemaType === 'time_series' && dateCols.length > 0) {
                    const dateCol = dateCols[0];
                    chartData = jsonData.map(row => {
                        const entry = { name: String(row[dateCol]).substring(0, 10) };
                        numericCols.forEach(col => {
                            const v = parseFloat(row[col]);
                            entry[col] = isNaN(v) ? 0 : v;
                        });
                        return entry;
                    }).sort((a, b) => new Date(a.name) - new Date(b.name));
                } else if (schemaType === 'kpi_summary') {
                    // Each numeric column becomes a "metric"
                    chartData = numericCols.map(col => ({
                        name: col,
                        value: schema[col].sum ?? schema[col].avg ?? 0,
                        avg: schema[col].avg,
                        min: schema[col].min,
                        max: schema[col].max,
                    }));
                } else {
                    // product_table, grouped_data, raw_table
                    chartData = aggregateByGroup(
                        jsonData.slice(0, 50), // cap at 50 rows for chart
                        labelCol,
                        groupCol,
                        numericCols
                    );
                }

                // ── Phase 2b: Derive legacy metrics for dashboard compatibility ──
                let legacyMetrics = deriveLegacyMetrics(jsonData);

                // If legacy extraction found nothing, synthesize from numeric columns
                if (Object.keys(legacyMetrics).length === 0 && numericCols.length > 0) {
                    const colLowers = numericCols.map(c => c.toLowerCase());

                    // Map well-known column name patterns to legacy metric keys
                    const autoMap = [
                        ['revenue', ['revenue', 'sales', 'income', 'turnover', 'gmv', 'mrr', 'arr', 'amount', 'total']],
                        ['orders', ['orders', 'quantity', 'qty', 'units', 'count', 'transactions']],
                        ['refunds', ['refunds', 'returns', 'rejected', 'churn']],
                        ['openTickets', ['tickets', 'complaints', 'issues', 'open']],
                        ['inflow', ['inflow', 'cash in', 'received', 'income']],
                        ['outflow', ['outflow', 'cash out', 'expense', 'cost', 'spend']],
                    ];

                    autoMap.forEach(([key, patterns]) => {
                        if (legacyMetrics[key] !== undefined) return;
                        for (let i = 0; i < numericCols.length; i++) {
                            const colLow = colLowers[i];
                            if (patterns.some(p => colLow.includes(p))) {
                                legacyMetrics[key] = schema[numericCols[i]].sum ?? schema[numericCols[i]].avg ?? 0;
                                break;
                            }
                        }
                    });

                    // If still nothing meaningful, populate with sums of first few numeric cols
                    if (Object.keys(legacyMetrics).length === 0) {
                        // use generic mapping — revenue = first numeric sum, orders = second, etc.
                        const genericKeys = ['revenue', 'orders', 'refunds'];
                        numericCols.slice(0, 3).forEach((col, idx) => {
                            legacyMetrics[genericKeys[idx]] = schema[col].sum ?? 0;
                        });
                    }
                }

                // ── Inventory: check if there's an inventory/stock sheet or columns ──
                const invSheetName = workbook.SheetNames.find(
                    n => n.toLowerCase().includes('inventory') || n.toLowerCase().includes('stock')
                );

                if (invSheetName && invSheetName !== firstSheetName) {
                    const invSheet = workbook.Sheets[invSheetName];
                    const invData = XLSX.utils.sheet_to_json(invSheet, { defval: 0 });
                    if (invData.length > 0) {
                        legacyMetrics.inventory = invData.map(row => ({
                            product: row.Product ?? row.product ?? row.Name ?? row.name ?? row.Item ?? 'Unknown',
                            stock: parseInt(row.Stock ?? row.stock ?? row.Quantity ?? row.qty ?? 0),
                            threshold: parseInt(row.Threshold ?? row.threshold ?? row.Limit ?? 100),
                        })).filter(item => !isNaN(item.stock));
                    }
                }

                // Auto-detect inventory from columns named Stock/Inventory/Quantity
                const stockCol = allHeaders.find(h =>
                    ['stock', 'inventory', 'quantity', 'qty', 'units in stock'].includes(h.toLowerCase().trim())
                );
                const nameCol = allHeaders.find(h =>
                    ['name', 'product', 'item', 'product name', 'title'].includes(h.toLowerCase().trim())
                );

                if (stockCol && nameCol && !legacyMetrics.inventory) {
                    legacyMetrics.inventory = jsonData.map(row => ({
                        product: String(row[nameCol] ?? 'Unknown').substring(0, 30),
                        stock: parseInt(row[stockCol] ?? 0),
                        threshold: 50,
                    })).filter(item => !isNaN(item.stock) && item.product !== 'Unknown');
                }

                if (Object.keys(legacyMetrics).length === 0) {
                    reject(new Error('Could not extract any usable data. Please check your file format.'));
                    return;
                }

                // ── Build schemaInfo summary ──────────────────────────────────
                const schemaInfo = {
                    columns: schema,
                    schemaType,
                    labelCol,
                    groupCol,
                    numericCols,
                    textCols,
                    categoricalCols,
                    dateCols,
                    totalRows: jsonData.length,
                };

                const summary = {
                    totalRows: jsonData.length,
                    totalCols: allHeaders.length,
                    numericCols: numericCols.length,
                    categoricalCols: categoricalCols.length,
                    textCols: textCols.length,
                    dateCols: dateCols.length,
                    schemaType,
                };

                resolve({
                    metrics: legacyMetrics,
                    headers: allHeaders,
                    rawTable: jsonData,
                    chartData,
                    summary,
                    schemaInfo,
                });

            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);

        if (isCsv) {
            reader.readAsText(file);
        } else {
            reader.readAsArrayBuffer(file);
        }
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Template Download
// ─────────────────────────────────────────────────────────────────────────────

export const downloadExcelTemplate = () => {
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
        { Metric: 'Revenue', Value: 50000 },
        { Metric: 'Orders', Value: 150 },
        { Metric: 'Refunds', Value: 5 },
        { Metric: 'Open Tickets', Value: 12 },
        { Metric: 'Resolved Tickets', Value: 45 },
        { Metric: 'Response Time', Value: 2.5 },
        { Metric: 'Inflow', Value: 55000 },
        { Metric: 'Outflow', Value: 40000 },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), 'Summary');

    // Product Catalog Sheet — new template tab
    const productData = [
        { ProductID: 'P001', Name: 'Widget A', Category: 'Electronics', Price: 25, Stock: 200 },
        { ProductID: 'P002', Name: 'Widget B', Category: 'Apparel', Price: 15, Stock: 80 },
        { ProductID: 'P003', Name: 'Gadget X', Category: 'Electronics', Price: 45, Stock: 55 },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(productData), 'Products');

    // Inventory Sheet
    const inventoryData = [
        { Product: 'Widget A', Stock: 500, Threshold: 100 },
        { Product: 'Widget B', Stock: 20, Threshold: 50 },
        { Product: 'Gadget X', Stock: 150, Threshold: 80 },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inventoryData), 'Inventory');

    XLSX.writeFile(wb, 'OpsPulse_Template.xlsx');
};
