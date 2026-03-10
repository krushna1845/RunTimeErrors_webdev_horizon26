import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePlan } from '../../context/PlanContext';
import {
    LayoutDashboard, Users, ShieldAlert, Tag, LogOut, Activity, Lock, HelpCircle, Database
} from 'lucide-react';

const nav = [
    { to: '/', icon: LayoutDashboard, label: 'Owner Dashboard', feature: null },
    { to: '/ops', icon: Users, label: 'Ops Manager', feature: 'ops_view' },
    { to: '/warroom', icon: ShieldAlert, label: 'War Room', feature: 'warroom' },
    { to: '/data-sources', icon: Database, label: 'Data Sources', feature: null },
    { to: '/pricing', icon: Tag, label: 'Upgrade', feature: null },
];

export default function Sidebar({ onHelpClick }) {
    const { user, logout } = useAuth();
    const { hasFeature, plan } = usePlan();

    return (
        <motion.aside
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
                width: 'var(--sidebar-w)',
                minHeight: '100vh',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 0',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 100,
            }}
        >
            {/* Logo */}
            <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 800, color: '#fff',
                    }}>⚡</div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>OpsPulse</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            {plan === 'premium' ? '✨ Premium' : 'Free'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {nav.map(({ to, icon: Icon, label, feature }) => {
                    const locked = feature && !hasFeature(feature);
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 10,
                                textDecoration: 'none',
                                color: locked ? 'var(--text-muted)' : isActive ? '#fff' : 'var(--text-secondary)',
                                background: isActive && !locked ? 'var(--accent-dim)' : 'transparent',
                                borderLeft: isActive && !locked ? '3px solid var(--accent)' : '3px solid transparent',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: 14,
                                pointerEvents: locked ? 'none' : 'auto',
                                transition: 'all 0.15s',
                            })}
                        >
                            <Icon size={18} />
                            <span style={{ flex: 1 }}>{label}</span>
                            {locked && <Lock size={13} />}
                        </NavLink>
                    );
                })}

                {/* Help Button */}
                <button
                    onClick={onHelpClick}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 10,
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: 14,
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginTop: 'auto',
                        transition: 'all 0.15s',
                    }}
                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                    <HelpCircle size={18} />
                    <span>Help & Support</span>
                </button>
            </nav>

            {/* User */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #10b981)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 13, color: '#fff',
                        textTransform: 'uppercase'
                    }}>{user?.business_name?.charAt(0) || 'U'}</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.business_name || 'My Business'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user?.role}</div>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn btn-ghost"
                    style={{ width: '100%', fontSize: 13, padding: '8px 12px', justifyContent: 'center' }}
                >
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </motion.aside>
    );
}
