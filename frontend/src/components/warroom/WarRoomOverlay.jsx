import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

export default function WarRoomOverlay({ score, onClose }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.92)',
                backdropFilter: 'blur(16px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 28,
            }}
        >
            {/* Pulsing red ring */}
            <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {[1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0.8 }}
                        animate={{ scale: 2.2, opacity: 0 }}
                        transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
                        style={{
                            position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                            border: '2px solid #ef4444',
                        }}
                    />
                ))}
                <div style={{
                    width: 120, height: 120, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, rgba(239,68,68,0.05) 100%)',
                    border: '2px solid #ef4444',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 4,
                }}>
                    <AlertTriangle size={32} color="#ef4444" />
                    <div style={{ fontSize: 32, fontWeight: 900, color: '#ef4444' }}>{score}</div>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <motion.h2
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ fontSize: 28, fontWeight: 900, color: '#ef4444', letterSpacing: '-0.03em', marginBottom: 8 }}
                >
                    ⚠ WAR ROOM ACTIVATED
                </motion.h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 400, lineHeight: 1.5 }}>
                    Business stress score has exceeded critical threshold. Immediate action required.
                </p>
            </div>

            {/* Crisis steps */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
                maxWidth: 640, width: '100%', padding: '0 20px',
            }}>
                {[
                    { step: '01', title: 'Check Revenue', desc: 'Identify sales decline source' },
                    { step: '02', title: 'Restock Critical', desc: 'Contact suppliers immediately' },
                    { step: '03', title: 'Clear Tickets', desc: 'Escalate unresolved issues' },
                ].map(({ step, title, desc }) => (
                    <div key={step} style={{
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 12, padding: '16px',
                    }}>
                        <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, fontFamily: 'JetBrains Mono', marginBottom: 6 }}>STEP {step}</div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{desc}</div>
                    </div>
                ))}
            </div>

            <button onClick={onClose} className="btn btn-ghost" style={{ marginTop: 8 }}>
                <X size={15} /> Exit War Room
            </button>
        </motion.div>
    );
}
