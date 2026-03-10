import { useState, useEffect, useCallback } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { getHistory } from '../../lib/api';

const RANGES = [
    { key: '1h', label: '1 Hour' },
    { key: '24h', label: '24 Hours' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '12m', label: '12 Months' },
];

const METRICS = [
    { key: 'revenue', label: 'Revenue (₹)', color: '#10b981', format: v => `₹${(v / 1000).toFixed(1)}k` },
    { key: 'stressScore', label: 'Stress Score', color: '#ef4444', format: v => `${v}/100` },
    { key: 'orders', label: 'Orders', color: '#6366f1', format: v => v },
    { key: 'openTickets', label: 'Open Tickets', color: '#f59e0b', format: v => v },
];

const formatTimestamp = (ts, range) => {
    if (!ts) return '';
    const d = new Date(ts);
    if (range === '1h' || range === '24h') {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (range === '7d' || range === '30d') {
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return d.toLocaleDateString([], { month: 'short', year: '2-digit' });
};

const CustomTooltip = ({ active, payload, label, range }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '12px 16px', fontSize: 12,
        }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontSize: 11 }}>
                {label && new Date(label).toLocaleString()}
            </div>
            {payload.map(p => (
                <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{p.name}:</span>
                    <span style={{ fontWeight: 700, color: p.color }}>
                        {METRICS.find(m => m.key === p.dataKey)?.format(Math.round(p.value)) ?? p.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default function HistoryChart() {
    const [range, setRange] = useState('24h');
    const [data, setData] = useState([]);
    const [activeMetrics, setActiveMetrics] = useState(['revenue', 'stressScore']);
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        try {
            const raw = await getHistory(range);
            setData(raw);
        } catch (err) {
            console.error('History fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        setLoading(true);
        fetchHistory();
        const interval = setInterval(fetchHistory, 15000); // refresh every 15s
        return () => clearInterval(interval);
    }, [fetchHistory]);

    const toggleMetric = (key) => {
        setActiveMetrics(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    return (
        <div className="card" style={{ padding: '20px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>📈 Business Health Timeline</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        Historical metric trends — live updating
                    </div>
                </div>
                {/* Range Toggle */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {RANGES.map(r => (
                        <button
                            key={r.key}
                            onClick={() => setRange(r.key)}
                            style={{
                                padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                                border: '1px solid',
                                borderColor: range === r.key ? 'var(--accent)' : 'var(--border)',
                                background: range === r.key ? 'var(--accent)' : 'transparent',
                                color: range === r.key ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metric toggles */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                {METRICS.map(m => (
                    <button
                        key={m.key}
                        onClick={() => toggleMetric(m.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                            border: `1px solid ${m.color}`,
                            background: activeMetrics.includes(m.key) ? m.color + '22' : 'transparent',
                            color: activeMetrics.includes(m.key) ? m.color : 'var(--text-muted)',
                            cursor: 'pointer', transition: 'all 0.15s',
                            opacity: activeMetrics.includes(m.key) ? 1 : 0.5,
                        }}
                    >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />
                        {m.label}
                    </button>
                ))}
            </div>

            {/* Chart */}
            {loading ? (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Loading history...
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={ts => formatTimestamp(ts, range)}
                            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            width={48}
                        />
                        <Tooltip content={<CustomTooltip range={range} />} />
                        {/* Crisis warning line for stress score */}
                        {activeMetrics.includes('stressScore') && (
                            <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Crisis Threshold', fill: '#f59e0b', fontSize: 10 }} />
                        )}
                        {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => (
                            <Line
                                key={m.key}
                                type="monotone"
                                dataKey={m.key}
                                name={m.label}
                                stroke={m.color}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )}

            {/* Footer summary */}
            {data.length > 0 && (
                <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                    {[
                        { label: 'Peak Revenue', value: `₹${Math.max(...data.map(d => d.revenue || 0)).toLocaleString()}` },
                        { label: 'Avg Stress Score', value: `${Math.round(data.reduce((s, d) => s + (d.stressScore || 0), 0) / data.length)}/100` },
                        { label: 'Data Points', value: data.length },
                        { label: 'Crisis Periods', value: data.filter(d => d.level === 'crisis').length },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
