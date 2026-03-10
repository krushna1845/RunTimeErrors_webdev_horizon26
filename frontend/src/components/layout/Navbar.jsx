import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, RefreshCw, MessageCircle, FileText, Download, Lock } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { usePlan } from '../../context/PlanContext';
import { generateCSV, generatePDF } from '../../lib/ReportService';
import { getReportSummary } from '../../lib/api';

export default function Navbar({ title, onChatOpen, onRefresh }) {
    const { alerts } = useAlerts();
    const { hasFeature } = usePlan();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [exporting, setExporting] = useState(false);
    const crisisCount = alerts.filter(a => a.type === 'crisis').length;

    const handleExport = async (format) => {
        try {
            setExporting(true);
            const data = await getReportSummary();
            if (format === 'csv') generateCSV(data);
            else generatePDF(data);
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to generate report. Please try again.');
        } finally {
            setExporting(false);
            setShowExport(false);
        }
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 28px',
                height: 64,
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                position: 'sticky',
                top: 0,
                zIndex: 90,
            }}
        >
            <div>
                <h1 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em' }}>{title}</h1>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {new Date().toLocaleString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {onRefresh && (
                    <button onClick={onRefresh} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                )}

                {/* Export Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => hasFeature('export') ? setShowExport(p => !p) : alert('Upgrade to Premium to export reports!')}
                        className="btn btn-ghost"
                        style={{ padding: '8px 12px', gap: 6 }}
                        disabled={exporting}
                    >
                        {exporting ? <RefreshCw size={15} className="spin" /> : <FileText size={15} />}
                        Export
                        {!hasFeature('export') && <Lock size={12} style={{ marginLeft: 4, opacity: 0.6 }} />}
                    </button>

                    <AnimatePresence>
                        {showExport && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                style={{
                                    position: 'absolute', right: 0, top: '110%',
                                    width: 180, background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: 10,
                                    overflow: 'hidden', zIndex: 200,
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                }}
                            >
                                <button
                                    onClick={() => handleExport('csv')}
                                    style={{
                                        width: '100%', padding: '10px 14px', border: 'none',
                                        background: 'transparent', color: 'var(--text-secondary)',
                                        fontSize: 13, cursor: 'pointer', textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: 8
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Download size={14} /> Download CSV
                                </button>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    style={{
                                        width: '100%', padding: '10px 14px', border: 'none',
                                        background: 'transparent', color: 'var(--text-secondary)',
                                        fontSize: 13, cursor: 'pointer', textAlign: 'left',
                                        display: 'flex', alignItems: 'center', gap: 8
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <FileText size={14} /> Download PDF
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {onChatOpen && (
                    <button onClick={onChatOpen} className="btn btn-primary" style={{ padding: '8px 14px' }}>
                        <MessageCircle size={15} /> AI Chat
                    </button>
                )}

                {/* Bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowDropdown(p => !p)}
                        style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 10, padding: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', position: 'relative',
                        }}
                    >
                        <Bell size={18} color="var(--text-secondary)" />
                        {crisisCount > 0 && (
                            <span style={{
                                position: 'absolute', top: 4, right: 4,
                                width: 8, height: 8, borderRadius: '50%',
                                background: 'var(--red)', border: '2px solid var(--bg-secondary)',
                            }} />
                        )}
                    </button>

                    <AnimatePresence>
                        {showDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                style={{
                                    position: 'absolute', right: 0, top: '110%',
                                    width: 320, background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: 12,
                                    overflow: 'hidden', zIndex: 200,
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                }}
                            >
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>
                                    Recent Alerts
                                </div>
                                {alerts.slice(0, 4).map(a => (
                                    <div key={a.id} style={{
                                        padding: '10px 16px',
                                        borderBottom: '1px solid var(--border)',
                                        display: 'flex', gap: 10, alignItems: 'flex-start',
                                    }}>
                                        <span style={{ fontSize: 16 }}>{a.type === 'crisis' ? '🔴' : a.type === 'opportunity' ? '🟢' : '🟡'}</span>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.message}</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
}
