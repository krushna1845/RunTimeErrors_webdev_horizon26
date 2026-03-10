import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CashFlowChart({ data }) {
    if (!data) return <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />;

    return (
        <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>Cash Flow (8 Weeks)</div>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.history} margin={{ top: 5, right: 5, bottom: 0, left: 5 }}>
                    <defs>
                        <linearGradient id="inflow-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="outflow-grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} width={55} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={2} fill="url(#inflow-grad)" dot={false} />
                    <Area type="monotone" dataKey="outflow" stroke="#ef4444" strokeWidth={2} fill="url(#outflow-grad)" dot={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
