import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { usePlan } from '../context/PlanContext';
import { Check } from 'lucide-react';

const tiers = [
    {
        id: 'free',
        name: 'Free', price: '$0', period: '/mo', color: '#6366f1',
        features: ['Owner Dashboard', 'Basic Stress Score', 'Simple Alerts', '24h Data History'],
        cta: 'Switch to Free',
    },
    {
        id: 'premium',
        name: 'Premium', price: '$29', period: '/mo', color: '#10b981', highlight: true,
        features: [
            'Everything in Free',
            'Ops Manager Dashboard',
            'War Room Mode',
            'AI Chatbot (Gemini)',
            'Crisis + Anomaly Alerts',
            'Predictive Risk Trends',
            'Action Recommendations',
            '90 Days Data History',
            'Export Reports',
        ],
        cta: 'Upgrade Now',
    },
];

export default function Pricing() {
    const { plan, upgradeToPremium, downgradeToPlan } = usePlan();

    return (
        <>
            <Navbar title="Pricing" />
            <div style={{ padding: '40px 28px', maxWidth: 800, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <h1 className="gradient-text" style={{ fontSize: 34, fontWeight: 900, marginBottom: 10 }}>
                        Simple, Transparent Pricing
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                        Upgrade to unlock the full power of OpsPulse.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {tiers.map((tier) => (
                        <motion.div
                            key={tier.name}
                            whileHover={{ y: -6 }}
                            className="card"
                            style={{
                                padding: '28px',
                                border: tier.highlight ? `1px solid ${tier.color}50` : '1px solid var(--border)',
                                boxShadow: tier.highlight ? `0 0 40px ${tier.color}20` : 'none',
                                position: 'relative', overflow: 'hidden',
                            }}
                        >
                            {tier.highlight && (
                                <div style={{
                                    position: 'absolute', top: 14, right: -24, background: tier.color,
                                    color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 32px',
                                    transform: 'rotate(35deg)', letterSpacing: '0.1em',
                                }}>POPULAR</div>
                            )}

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ fontSize: 13, color: tier.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{tier.name}</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span style={{ fontSize: 40, fontWeight: 900 }}>{tier.price}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{tier.period}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                                {tier.features.map(f => (
                                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                                        <Check size={15} color={tier.color} style={{ flexShrink: 0 }} />
                                        <span>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`btn ${tier.highlight ? 'btn-primary' : 'btn-ghost'}`}
                                disabled={plan === tier.id}
                                onClick={() => {
                                    if (tier.id === 'premium') {
                                        upgradeToPremium();
                                    } else {
                                        downgradeToPlan('free');
                                    }
                                }}
                                style={{
                                    width: '100%', justifyContent: 'center',
                                    background: tier.highlight ? tier.color : undefined,
                                    opacity: (plan === tier.id) ? 0.6 : 1,
                                    cursor: (plan === tier.id) ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {plan === tier.id ? '✅ Active Plan' : tier.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 24 }}>
                    Demo mode — clicking "Upgrade Now" will instantly activate Premium features.
                </p>
            </div>
        </>
    );
}
