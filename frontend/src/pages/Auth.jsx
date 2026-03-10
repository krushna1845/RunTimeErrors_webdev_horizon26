import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../components/auth/LoginPage';
import RegisterPage from '../components/auth/RegisterPage';

export default function Auth() {
    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            background: 'var(--bg-primary)',
        }}>
            {/* Left panel */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px',
            }}>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </div>

            {/* Right panel — decorative */}
            <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.08) 100%)',
                borderLeft: '1px solid var(--border)',
                padding: '40px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{
                    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
                    top: '10%', right: '10%',
                }} />
                <div style={{
                    position: 'absolute', width: 250, height: 250, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                    bottom: '15%', left: '10%',
                }} />
                <div style={{ position: 'relative', textAlign: 'center', maxWidth: 360 }}>
                    <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
                    <h2 className="gradient-text" style={{ fontSize: 28, fontWeight: 900, marginBottom: 14 }}>
                        Your Business, Under Control
                    </h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: 14 }}>
                        OpsPulse monitors your sales, inventory, support, and cash flow — all in one dashboard. Know when things go wrong <i>before</i> it's too late.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 28 }}>
                        {[['📊', 'Live Metrics'], ['⚠️', 'Smart Alerts'], ['🤖', 'AI Advisor'], ['🛡️', 'War Room']].map(([icon, label]) => (
                            <div key={label} style={{
                                background: 'var(--bg-glass)', border: '1px solid var(--border)',
                                borderRadius: 10, padding: '12px',
                                backdropFilter: 'blur(12px)', textAlign: 'left', display: 'flex', gap: 8, alignItems: 'center',
                            }}>
                                <span>{icon}</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
