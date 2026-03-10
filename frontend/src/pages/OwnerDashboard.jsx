import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MetricCard from '../components/dashboard/MetricCard';
import StressScoreGauge from '../components/dashboard/StressScoreGauge';
import SalesChart from '../components/dashboard/SalesChart';
import InventoryChart from '../components/dashboard/InventoryChart';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import SupportTicketCard from '../components/dashboard/SupportTicketCard';
import AlertPanel from '../components/dashboard/AlertPanel';
import RecommendationFeed from '../components/recommendations/RecommendationFeed';
import { useMetrics } from '../hooks/useMetrics';
import { useStressScore } from '../hooks/useStressScore';
import { useAlerts } from '../hooks/useAlerts';
import { usePlan } from '../context/PlanContext';
import { useUI } from '../context/UIContext';
import { getRecommendations, setSevereCrisis } from '../lib/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { Lock } from 'lucide-react';

const section = (title, children, style = {}) => (
    <section className="card" style={{ padding: '20px', ...style }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, letterSpacing: '-0.02em' }}>{title}</div>
        {children}
    </section>
);

export default function OwnerDashboard() {
    const { sales, inventory, support, cashflow, isExternal, source, refresh } = useMetrics(5000);
    const { data: scoreData } = useStressScore(5000);
    const { alerts, dismiss } = useAlerts(7000);
    const { hasFeature } = usePlan();
    const { toggleChat } = useUI();
    const navigate = useNavigate();
    const [recs, setRecs] = useState([]);
    const [isCrisisMode, setIsCrisisMode] = useState(false);

    useEffect(() => {
        const fetchRecs = async () => {
            const data = await getRecommendations();
            setRecs(data);
        };
        fetchRecs();
    }, [scoreData]);

    const toggleCrisis = async () => {
        const nextMode = !isCrisisMode;
        await setSevereCrisis(nextMode);
        setIsCrisisMode(nextMode);
        refresh();
    };

    const warRoomTriggered = scoreData?.score >= 80;

    return (
        <>
            <Navbar
                title="Owner Dashboard"
                onChatOpen={hasFeature('chatbot') ? toggleChat : undefined}
                onRefresh={refresh}
            />

            <div style={{ padding: '10px 28px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 15, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={toggleCrisis}
                        className={isCrisisMode ? "btn btn-danger" : "btn btn-ghost"}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                    >
                        {isCrisisMode ? "🛑 Stop Severe Crisis" : "🔥 Trigger Severe Crisis"}
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                    {isExternal ? (
                        <div style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid var(--primary)',
                            color: 'var(--primary)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }} />
                            LIVE: {source}
                        </div>
                    ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            Simulated environment for testing crisis response
                        </span>
                    )}
                </div>
            </div>

            {/* War Room Banner */}
            {warRoomTriggered && (
                <div
                    onClick={() => navigate('/warroom')}
                    style={{
                        background: 'rgba(239,68,68,0.12)', borderBottom: '1px solid rgba(239,68,68,0.3)',
                        padding: '10px 28px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 10,
                    }}
                >
                    <span style={{ animation: 'pulse-ring 1.5s infinite' }}>🔴</span>
                    <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 13 }}>
                        CRITICAL: Stress score {scoreData?.score} — Click to enter War Room
                    </span>
                </div>
            )}

            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Top row: KPI cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <MetricCard title="Revenue" value={sales ? formatCurrency(sales.current.revenue) : '—'} sub="Today" delta={2.4} icon="💰" />
                    <MetricCard title="Orders" value={sales ? formatNumber(sales.current.orders) : '—'} sub="Last 24h" delta={-1.8} icon="📦" />
                    <MetricCard title="Refunds" value={sales ? formatNumber(sales.current.refunds) : '—'} sub="Last 24h" delta={5.2} icon="↩️" />
                    <MetricCard title="Cash Balance" value={cashflow ? formatCurrency(cashflow.current.balance) : '—'} sub="Current" delta={cashflow ? ((cashflow.current.inflow - cashflow.current.outflow) / cashflow.current.outflow * 100) : 0} icon="🏦" />
                </div>

                {/* Middle row: Gauge + Sales + Inventory */}
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: 16 }}>
                    {section('Business Stress Score',
                        <StressScoreGauge data={scoreData} />,
                        { display: 'flex', flexDirection: 'column' }
                    )}
                    {section('Sales Trends', <SalesChart data={sales} />)}
                    {section('Inventory', <InventoryChart data={inventory} />)}
                </div>

                {/* Bottom row: Cashflow + Support + Alerts + Recs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {section('Cash Flow', <CashFlowChart data={cashflow} />)}
                    {section('Support Overview', <SupportTicketCard data={support} />)}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {section('Live Alerts', <AlertPanel alerts={alerts} onDismiss={dismiss} />)}
                    {section('Recommendations',
                        hasFeature('recommendations')
                            ? <RecommendationFeed data={recs} />
                            : (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                                    <Lock size={24} style={{ marginBottom: 8 }} />
                                    <p style={{ fontSize: 13 }}>Upgrade to Premium to unlock recommendations.</p>
                                </div>
                            )
                    )}
                </div>
            </div>
        </>
    );
}
