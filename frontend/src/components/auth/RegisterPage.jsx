import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'owner' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, login } = useAuth();
    const navigate = useNavigate();

    const update = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return setError('All fields are required.');
        if (form.password !== form.confirm) return setError('Passwords do not match.');
        setLoading(true); setError('');
        try {
            const res = await register({
                business_name: form.name,
                email: form.email,
                password: form.password,
                role: form.role
            });
            if (res.success) {
                const loginRes = await login(form.email, form.password, form.role);
                if (loginRes.success) {
                    navigate('/');
                } else {
                    setError(loginRes.error);
                }
            } else {
                setError(res.error);
            }
        } catch {
            setError('Registration failed. Please try again.');
        } finally {
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
                <div className="gradient-text" style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>Get Started ⚡</div>
                <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Create your OpsPulse account</p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[['name', 'Business Name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password'], ['confirm', 'Confirm Password', 'password']].map(([key, label, type]) => (
                    <div key={key}>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                        <input type={type} value={form[key]} onChange={update(key)} style={{ width: '100%' }} />
                    </div>
                ))}

                <div style={{ marginTop: 4 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6, fontWeight: 600 }}>Role</label>
                    <select value={form.role} onChange={update('role')} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                        <option value="owner">Business Owner</option>
                        <option value="manager">Operations Manager</option>
                    </select>
                </div>
                {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                    {loading ? 'Creating account…' : 'Create Account'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    Already have one? <Link to="/auth" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign In →</Link>
                </p>
            </form>
        </motion.div>
    );
}
