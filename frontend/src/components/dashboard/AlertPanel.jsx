import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { alertMeta } from '../../lib/utils';

export default function AlertPanel({ alerts, onDismiss }) {
    if (!alerts) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AnimatePresence>
                {alerts.map(alert => {
                    const { color, bg, icon } = alertMeta(alert.type);
                    return (
                        <motion.div
                            key={alert.id}
                            layout
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            style={{
                                background: bg,
                                border: `1px solid ${color}30`,
                                borderLeft: `3px solid ${color}`,
                                borderRadius: 10,
                                padding: '12px 14px',
                                display: 'flex',
                                gap: 12,
                                alignItems: 'flex-start',
                            }}
                        >
                            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>
                                    {alert.title}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{alert.message}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{alert.time}</div>
                            </div>
                            {onDismiss && (
                                <button
                                    onClick={() => onDismiss(alert.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
            {alerts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 13 }}>
                    ✅ No active alerts
                </div>
            )}
        </div>
    );
}
