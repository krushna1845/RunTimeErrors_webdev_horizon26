import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
            {payload.map(p => (
                <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: {p.name === 'revenue' ? `$${Number(p.value).toLocaleString()}` : p.value}
                </div>
            ))}
        </div>
    );
};

export default function SalesChart({ data }) {
    if (!data) return <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />;

    return (
        <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>Revenue & Orders (12h)</div>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.history} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                    <defs>
                        <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} width={50} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenue-grad)" dot={false} />
                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
