import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import WarRoomOverlay from '../components/warroom/WarRoomOverlay';
import AlertPanel from '../components/dashboard/AlertPanel';
import RecommendationFeed from '../components/recommendations/RecommendationFeed';
import { useStressScore } from '../hooks/useStressScore';
import { useAlerts } from '../hooks/useAlerts';
import { getRecommendations } from '../lib/api';
import { usePlan } from '../context/PlanContext';
import { Lock } from 'lucide-react';

export default function WarRoom() {
    const { data } = useStressScore(3000);
    const { alerts, dismiss } = useAlerts(5000);
    const { hasFeature } = usePlan();
    const navigate = useNavigate();
    const [overlayOpen, setOverlayOpen] = useState(false);
    const [recs, setRecs] = useState([]);

    useEffect(() => {
        getRecommendations()
            .then(setRecs)
            .catch(() => setRecs([]));
    }, []);

    if (!hasFeature('warroom')) {
        return (
            <>
                <Navbar title="War Room" />
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', gap: 16, padding: '60px',
                }}>
                    <Lock size={48} color="var(--text-muted)" />
                    <h2 style={{ fontSize: 22, fontWeight: 700 }}>War Room is a Premium Feature</h2>
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', maxWidth: 360 }}>
                        Upgrade to Premium to access War Room mode, which activates during business crises.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/pricing')}>View Pricing</button>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar title="⚠ War Room" />

            {/* Score bar */}
            <div style={{
                margin: '24px 28px 0',
                background: data?.level === 'crisis' ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
                border: `1px solid ${data?.level === 'crisis' ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                borderRadius: 14, padding: '18px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Current Stress Score</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: data?.level === 'crisis' ? '#ef4444' : '#10b981' }}>{data?.score ?? '—'}<span style={{ fontSize: 16, color: 'var(--text-muted)' }}>/100</span></div>
                </div>
                {data?.score >= 60 && (
                    <button className="btn btn-danger" onClick={() => setOverlayOpen(true)}>
                        🚨 Enter War Room
                    </button>
                )}
                {data?.score < 60 && (
                    <span className="badge badge-green">No Crisis Detected</span>
                )}
            </div>

            <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <section className="card" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🔴 Active Alerts</div>
                    <AlertPanel alerts={alerts} onDismiss={dismiss} />
                </section>
                <section className="card" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🎯 Action Plan</div>
                    <RecommendationFeed data={recs} />
                </section>
            </div>

            <AnimatePresence>
                {overlayOpen && <WarRoomOverlay score={data?.score} onClose={() => setOverlayOpen(false)} />}
            </AnimatePresence>
        </>
    );
}
