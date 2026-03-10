import { motion } from 'framer-motion';

const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function RecommendationFeed({ data }) {
    if (!data) return <div className="skeleton" style={{ height: 100, borderRadius: 10 }} />;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.map((rec, i) => (
                <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderLeft: `3px solid ${priorityColor[rec.priority]}`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                    }}
                >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{rec.icon}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{rec.title}</span>
                            <span style={{
                                fontSize: 10, fontWeight: 700,
                                padding: '2px 7px', borderRadius: 999,
                                background: `${priorityColor[rec.priority]}20`,
                                color: priorityColor[rec.priority],
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>{rec.priority}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{rec.detail}</div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
