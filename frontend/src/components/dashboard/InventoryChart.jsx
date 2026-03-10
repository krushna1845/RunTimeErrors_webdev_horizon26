import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function InventoryChart({ data }) {
    if (!data) return <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />;

    const chartData = data.map(item => ({
        name: item.product,
        stock: item.stock,
        threshold: item.threshold,
        fill: item.stock < item.threshold ? '#ef4444' : item.stock < item.threshold * 1.5 ? '#f59e0b' : '#10b981',
    }));

    return (
        <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>Inventory Levels</div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.9} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {[['#10b981', 'OK'], ['#f59e0b', 'Medium'], ['#ef4444', 'Critical']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
                    </div>
                ))}
            </div>
        </div>
    );
}
