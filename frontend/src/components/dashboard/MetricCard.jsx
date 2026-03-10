import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, sub, delta, icon, color = 'var(--accent)' }) {
    const isUp = delta > 0;

    return (
        <motion.div
            className="card"
            whileHover={{ y: -3, boxShadow: `0 12px 32px rgba(0,0,0,0.3)` }}
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{title}</span>
                <span style={{
                    fontSize: 20,
                    background: `rgba(${color === 'var(--accent)' ? '99,102,241' : '16,185,129'}, 0.12)`,
                    width: 36, height: 36, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{icon}</span>
            </div>

            <div>
                <motion.div
                    key={value}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}
                >
                    {value}
                </motion.div>
                {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
            </div>

            {delta !== undefined && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 12, fontWeight: 600,
                    color: isUp ? 'var(--green)' : 'var(--red)',
                }}>
                    {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {Math.abs(delta).toFixed(1)}% vs last period
                </div>
            )}
        </motion.div>
    );
}
