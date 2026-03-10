import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('owner@opspulse.com');
    const [password, setPassword] = useState('password');
    const [role, setRole] = useState('owner');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError('Please fill all fields.');
        setLoading(true); setError('');
        const res = await login(email, password, role);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error);
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ width: '100%', maxWidth: 380 }}
        >
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <div className="gradient-text" style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>OpsPulse ⚡</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Sign in to your dashboard</p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Role</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {['owner', 'manager'].map(r => (
                            <button
                                key={r} type="button"
                                onClick={() => setRole(r)}
                                style={{
                                    flex: 1, padding: '9px', borderRadius: 10,
                                    border: `1px solid ${role === r ? 'var(--accent)' : 'var(--border)'}`,
                                    background: role === r ? 'var(--accent-dim)' : 'var(--bg-secondary)',
                                    color: role === r ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize',
                                }}
                            >
                                {r === 'owner' ? '👤 Owner' : '⚙️ Ops Manager'}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={{ width: '100%' }} />
                </div>
                <div>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Password</label>
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" style={{ width: '100%' }} />
                </div>
                {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                    {loading ? 'Signing in…' : 'Sign In'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    No account?{' '}
                    <Link to="/auth/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Register →</Link>
                </p>
            </form>
        </motion.div>
    );
}
