import * as XLSX from 'xlsx';

/**
 * Parses an Excel (.xlsx/.xls) or CSV file and extracts business metrics.
 * Supports two layouts:
 *   - Key-Value style: columns "Metric" and "Value" (template style)
 *   - Column style: headers are metric names, first data row has values
 */
export const parseMetricsExcel = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const isCsv = file.name.toLowerCase().endsWith('.csv');

        reader.onload = (e) => {
            try {
                let workbook;

                if (isCsv) {
                    // CSV must be read as text string
                    const text = e.target.result;
                    workbook = XLSX.read(text, { type: 'string' });
                } else {
                    // Excel binary files
                    const data = new Uint8Array(e.target.result);
                    workbook = XLSX.read(data, { type: 'array' });
                }

                // Get first sheet for general metrics
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Helper to match column headers flexibly (case-insensitive)
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

                const metrics = {};

                jsonData.forEach(row => {
                    // ── Scenario A: Row-based Key-Value (Template style) ──────────────
                    // row: { Metric: 'Revenue', Value: 50000 }
                    const rawKey = String(
                        row['Metric'] ?? row['metric'] ?? row['key'] ?? row['category'] ?? ''
                    ).toLowerCase().trim();

                    // Use explicit key access to avoid 0-falsy bug
                    const valueRaw =
                        row['Value'] !== undefined ? row['Value'] :
                            row['value'] !== undefined ? row['value'] :
                                row['amount'] !== undefined ? row['amount'] : null;

                    const rawVal = valueRaw !== null ? parseFloat(valueRaw) : NaN;

                    const mapKV = (targetKey, aliasList) => {
                        if (rawKey && aliasList.some(a => rawKey.includes(a.toLowerCase()))) {
                            if (!isNaN(rawVal)) {
                                metrics[targetKey] = rawVal;
                            }
                        }
                    };

                    if (rawKey) {
                        mapKV('revenue', ['revenue', 'sales', 'turnover']);
                        mapKV('orders', ['order']);
                        mapKV('refunds', ['refund', 'return']);
                        mapKV('openTickets', ['open ticket', 'active ticket', 'open_ticket']);
                        mapKV('resolvedTickets', ['resolved ticket', 'closed ticket', 'resolved_ticket']);
                        mapKV('avgResponse', ['response time', 'avg response', 'response_time', 'avgresponse']);
                        mapKV('inflow', ['inflow', 'money in', 'cash in', 'cash_in']);
                        mapKV('outflow', ['outflow', 'money out', 'cash out', 'cash_out']);
                    }

                    // ── Scenario B: Column-based (Headers are metric names) ────────────
                    // row: { Revenue: 50000, Orders: 150, ... }
                    const colRevenue = findValue(row, 'Revenue', 'Sales', 'Total Revenue', 'Turnover');
                    if (colRevenue !== null) metrics.revenue = colRevenue;

                    const colOrders = findValue(row, 'Orders', 'Total Orders', 'Order Count');
                    if (colOrders !== null) metrics.orders = Math.floor(colOrders);

                    const colRefunds = findValue(row, 'Refunds', 'Total Refunds', 'Returns');
                    if (colRefunds !== null) metrics.refunds = Math.floor(colRefunds);

                    const colOpen = findValue(row, 'Open Tickets', 'Tickets', 'Active Tickets', 'Open_Tickets');
                    if (colOpen !== null) metrics.openTickets = Math.floor(colOpen);

                    const colResolved = findValue(row, 'Resolved Tickets', 'Resolved', 'Closed Tickets', 'Resolved_Tickets');
                    if (colResolved !== null) metrics.resolvedTickets = Math.floor(colResolved);

                    const colResp = findValue(row, 'Response Time', 'Avg Response', 'Response', 'Avg_Response');
                    if (colResp !== null) metrics.avgResponse = colResp;

                    const colIn = findValue(row, 'Inflow', 'Cash In', 'Money In', 'Cash_In');
                    if (colIn !== null) metrics.inflow = colIn;

                    const colOut = findValue(row, 'Outflow', 'Cash Out', 'Money Out', 'Cash_Out');
                    if (colOut !== null) metrics.outflow = colOut;
                });

                // ── Inventory parsing (separate sheet) ────────────────────────────────
                const invSheetName = workbook.SheetNames.find(
                    n => n.toLowerCase().includes('inventory') || n.toLowerCase().includes('stock')
                );
                if (invSheetName) {
                    const invSheet = workbook.Sheets[invSheetName];
                    const invData = XLSX.utils.sheet_to_json(invSheet);
                    if (invData.length > 0) {
                        metrics.inventory = invData.map(row => ({
                            product: row.Product ?? row.product ?? row.Item ?? row.item ?? 'Unknown',
                            stock: parseInt(row.Stock ?? row.stock ?? row.Quantity ?? row.qty ?? 0),
                            threshold: parseInt(row.Threshold ?? row.threshold ?? row.Limit ?? 100)
                        })).filter(item => !isNaN(item.stock));
                    }
                }

                if (Object.keys(metrics).length === 0) {
                    reject(new Error('No recognizable metric data found in file. Please check the format.'));
                    return;
                }

                resolve(metrics);
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
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Inventory Sheet
    const inventoryData = [
        { Product: 'Widget A', Stock: 500, Threshold: 100 },
        { Product: 'Widget B', Stock: 20, Threshold: 50 },
        { Product: 'Gadget X', Stock: 150, Threshold: 80 },
    ];
    const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
    XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventory');

    XLSX.writeFile(wb, 'OpsPulse_Template.xlsx');
};
