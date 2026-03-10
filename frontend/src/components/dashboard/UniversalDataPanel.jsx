import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { Table2, BarChart2, PieChart as PieIcon, TrendingUp, Tag, Hash, AlignLeft, Calendar } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette for multi-series charts
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = [
    '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared tooltip style
// ─────────────────────────────────────────────────────────────────────────────
const tooltipStyle = {
    contentStyle: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        fontSize: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    },
    labelStyle: { color: 'var(--text-main)', fontWeight: 600 },
    itemStyle: { color: 'var(--text-muted)' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Column type badge
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_ICON = {
    numeric: { icon: <Hash size={11} />, color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    categorical: { icon: <Tag size={11} />, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    text: { icon: <AlignLeft size={11} />, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    id: { icon: <Hash size={11} />, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
    date: { icon: <Calendar size={11} />, color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
};

function ColTypeBadge({ colName, type }) {
    const t = TYPE_ICON[type] || TYPE_ICON.text;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: t.bg, color: t.color,
            padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: `1px solid ${t.color}33`,
        }}>
            {t.icon} {colName}
        </span>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema Summary Banner
// ─────────────────────────────────────────────────────────────────────────────
function SchemaBanner({ summary, schemaInfo, businessInfo }) {
    const schemaLabels = {
        time_series: '📈 Time Series',
        product_table: '📦 Product Table / Item List',
        kpi_summary: '📊 KPI Summary',
        grouped_data: '🗂 Grouped Data',
        raw_table: '📋 Raw Table',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '16px 20px',
                marginBottom: 20,
            }}
        >
            {/* Row 1: Stats */}
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 14 }}>
                {[
                    { label: 'Rows', value: summary.totalRows },
                    { label: 'Columns', value: summary.totalCols },
                    { label: 'Numeric', value: summary.numericCols, color: '#6366f1' },
                    { label: 'Text', value: summary.textCols, color: '#10b981' },
                    { label: 'Category', value: summary.categoricalCols, color: '#f59e0b' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color || 'var(--text-main)' }}>
                            {s.value}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{s.label}</div>
                    </div>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Detected layout:</span>
                    <span style={{
                        background: businessInfo.color + '18',
                        border: `1px solid ${businessInfo.color}44`,
                        color: businessInfo.color,
                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    }}>
                        {schemaLabels[summary.schemaType] || '📋 Table'}
                    </span>
                </div>
            </div>

            {/* Row 2: Column pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(schemaInfo.columns).map(([col, info]) => (
                    <ColTypeBadge key={col} colName={col} type={info.type} />
                ))}
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Preview Table
// ─────────────────────────────────────────────────────────────────────────────
function DataPreviewTable({ rawTable, schemaInfo }) {
    const headers = Object.keys(schemaInfo.columns);
    const preview = rawTable.slice(0, 10);

    return (
        <div style={{
            borderRadius: 12, border: '1px solid var(--border)',
            overflow: 'hidden', fontSize: 12,
        }}>
            <div style={{
                overflowX: 'auto',
                maxHeight: 280,
                overflowY: 'auto',
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', position: 'sticky', top: 0 }}>
                            <th style={{
                                padding: '8px 12px', textAlign: 'left',
                                color: 'var(--text-muted)', fontWeight: 600, fontSize: 11,
                                borderBottom: '1px solid var(--border)',
                                whiteSpace: 'nowrap',
                            }}>#</th>
                            {headers.map(h => {
                                const info = schemaInfo.columns[h];
                                const typeColors = {
                                    numeric: '#6366f1', categorical: '#f59e0b',
                                    text: '#10b981', id: '#94a3b8', date: '#ec4899',
                                };
                                return (
                                    <th key={h} style={{
                                        padding: '8px 12px', textAlign: 'left',
                                        color: typeColors[info.type] || 'var(--text-muted)',
                                        fontWeight: 600, fontSize: 11,
                                        borderBottom: '1px solid var(--border)',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {h}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {preview.map((row, idx) => (
                            <tr key={idx} style={{
                                background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                                transition: 'background 0.15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.06)'}
                                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'}
                            >
                                <td style={{
                                    padding: '7px 12px', color: 'var(--text-muted)',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    {idx + 1}
                                </td>
                                {headers.map(h => {
                                    const info = schemaInfo.columns[h];
                                    const val = row[h];
                                    const isNum = info.type === 'numeric';
                                    return (
                                        <td key={h} style={{
                                            padding: '7px 12px',
                                            color: isNum ? '#a5b4fc' : 'var(--text-main)',
                                            borderBottom: '1px solid var(--border)',
                                            fontWeight: isNum ? 600 : 400,
                                            whiteSpace: 'nowrap',
                                            maxWidth: 180,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}>
                                            {isNum && typeof val === 'number'
                                                ? val.toLocaleString()
                                                : String(val ?? '—')}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {rawTable.length > 10 && (
                <div style={{
                    padding: '8px 12px', background: 'var(--bg-secondary)',
                    color: 'var(--text-muted)', fontSize: 11,
                    borderTop: '1px solid var(--border)', textAlign: 'center',
                }}>
                    Showing first 10 of {rawTable.length} rows
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Renderers
// ─────────────────────────────────────────────────────────────────────────────

function ProductTableChart({ chartData, schemaInfo }) {
    const numericCols = schemaInfo.numericCols.slice(0, 4); // max 4 series
    if (!chartData.length || !numericCols.length) return null;

    // Decide whether to render one chart per numeric col or multi-bar
    const isMultiBar = numericCols.length > 1;
    const isManyItems = chartData.length > 10;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {numericCols.map((col, ci) => {
                const color = PALETTE[ci % PALETTE.length];
                const sorted = [...chartData].sort((a, b) => (b[col] ?? 0) - (a[col] ?? 0));
                const topItems = sorted.slice(0, 15);

                return (
                    <div key={col}>
                        <div style={{
                            fontSize: 13, fontWeight: 600, color: color,
                            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <span style={{ width: 10, height: 10, borderRadius: 3, background: color, display: 'inline-block' }} />
                            {col}
                        </div>
                        <ResponsiveContainer width="100%" height={Math.max(180, topItems.length * 28)}>
                            <BarChart
                                layout="vertical"
                                data={topItems}
                                margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
                            >
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={false} />
                                <XAxis
                                    type="number"
                                    tick={{ fill: '#475569', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={110}
                                />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey={col} radius={[0, 6, 6, 0]} maxBarSize={22}>
                                    {topItems.map((_, i) => (
                                        <Cell key={i} fill={color} fillOpacity={1 - i * 0.04} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            })}
        </div>
    );
}

function GroupedDataChart({ chartData, schemaInfo }) {
    const numericCols = schemaInfo.numericCols.slice(0, 4);
    if (!chartData.length || !numericCols.length) return null;

    // If only one numeric column, use a pie chart for category breakdown
    if (numericCols.length === 1) {
        const col = numericCols[0];
        const pieData = chartData.map((d, i) => ({
            name: d.name,
            value: d[col] ?? 0,
            fill: PALETTE[i % PALETTE.length],
        }));

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                        {col} by Category
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%" cy="50%"
                                outerRadius={90}
                                innerRadius={50}
                                paddingAngle={3}
                            >
                                {pieData.map((entry, i) => (
                                    <Cell key={i} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip {...tooltipStyle} />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                        {col} — Bar View
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={chartData} margin={{ top: 5, right: 12, bottom: 0, left: 0 }}>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey={col} radius={[6, 6, 0, 0]}>
                                {chartData.map((_, i) => (
                                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    // Multiple numerics: grouped bar
    return (
        <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                {numericCols.join(' vs ')} by Category
            </div>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 5, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Legend formatter={v => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v}</span>} />
                    {numericCols.map((col, ci) => (
                        <Bar key={col} dataKey={col} fill={PALETTE[ci]} radius={[4, 4, 0, 0]} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function TimeSeriesChart({ chartData, schemaInfo }) {
    const numericCols = schemaInfo.numericCols.slice(0, 4);
    if (!chartData.length || !numericCols.length) return null;

    return (
        <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>
                {numericCols.join(', ')} over time
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 12, bottom: 0, left: 0 }}>
                    <defs>
                        {numericCols.map((col, ci) => (
                            <linearGradient key={col} id={`grad-${ci}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={PALETTE[ci]} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={PALETTE[ci]} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Legend formatter={v => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v}</span>} />
                    {numericCols.map((col, ci) => (
                        <Area
                            key={col}
                            type="monotone"
                            dataKey={col}
                            stroke={PALETTE[ci]}
                            fill={`url(#grad-${ci})`}
                            strokeWidth={2}
                            dot={chartData.length <= 20}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function KpiSummaryChart({ chartData, schemaInfo }) {
    // chartData: [{name, value, avg, min, max}]
    if (!chartData.length) return null;

    return (
        <div>
            {/* KPI cards row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(chartData.length, 4)}, 1fr)`,
                gap: 12, marginBottom: 20,
            }}>
                {chartData.map((item, ci) => {
                    const color = PALETTE[ci % PALETTE.length];
                    return (
                        <div key={item.name} style={{
                            background: color + '10',
                            border: `1px solid ${color}33`,
                            borderRadius: 12,
                            padding: '14px 16px',
                        }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                                {item.name}
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 800, color }}>
                                {item.value >= 1000
                                    ? item.value.toLocaleString(undefined, { maximumFractionDigits: 1 })
                                    : item.value}
                            </div>
                            {item.avg !== item.value && (
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                    avg {item.avg?.toLocaleString() ?? '—'} · min {item.min} · max {item.max}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Bar overview */}
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 12, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'charts', label: 'Charts', icon: <BarChart2 size={14} /> },
    { id: 'table', label: 'Data Preview', icon: <Table2 size={14} /> },
];

export default function UniversalDataPanel({ rawTable, chartData, summary, schemaInfo, businessInfo }) {
    const [tab, setTab] = useState('charts');

    if (!rawTable || !schemaInfo) return null;

    const renderChart = () => {
        const type = summary.schemaType;
        if (type === 'time_series') return <TimeSeriesChart chartData={chartData} schemaInfo={schemaInfo} />;
        if (type === 'kpi_summary') return <KpiSummaryChart chartData={chartData} schemaInfo={schemaInfo} />;
        if (type === 'grouped_data') return <GroupedDataChart chartData={chartData} schemaInfo={schemaInfo} />;
        // product_table and raw_table
        return <ProductTableChart chartData={chartData} schemaInfo={schemaInfo} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            {/* Schema Banner */}
            <SchemaBanner summary={summary} schemaInfo={schemaInfo} businessInfo={businessInfo} />

            {/* Tab Bar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {TABS.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                            background: tab === t.id ? 'var(--primary)' : 'transparent',
                            color: tab === t.id ? '#fff' : 'var(--text-muted)',
                            border: `1px solid ${tab === t.id ? 'var(--primary)' : 'var(--border)'}`,
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                >
                    {tab === 'charts' && (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 14, padding: '20px',
                        }}>
                            {renderChart()}
                        </div>
                    )}
                    {tab === 'table' && (
                        <DataPreviewTable rawTable={rawTable} schemaInfo={schemaInfo} />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
