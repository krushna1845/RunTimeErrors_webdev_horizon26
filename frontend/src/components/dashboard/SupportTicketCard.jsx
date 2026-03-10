import { motion } from 'framer-motion';

export default function SupportTicketCard({ data }) {
    if (!data) return <div className="skeleton" style={{ height: 120, borderRadius: 10 }} />;
    const ratio = data.resolvedTickets / (data.openTickets + data.resolvedTickets);

    return (
        <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>Support Tickets</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                    { label: 'Open', val: data.openTickets, color: '#ef4444' },
                    { label: 'Resolved', val: data.resolvedTickets, color: '#10b981' },
                    { label: 'Avg Response', val: `${data.avgResponse}h`, color: '#f59e0b' },
                    { label: 'Satisfaction', val: `${data.satisfaction}★`, color: '#6366f1' },
                ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color, marginTop: 2 }}>{val}</div>
                    </div>
                ))}
            </div>
            {/* Resolution rate bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>Resolution Rate</span><span style={{ color: '#10b981', fontWeight: 600 }}>{(ratio * 100).toFixed(0)}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ratio * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: 3 }}
                    />
                </div>
            </div>
        </div>
    );
}
