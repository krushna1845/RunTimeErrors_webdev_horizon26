import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileSpreadsheet, Globe, Upload, Download, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { parseMetricsExcel, downloadExcelTemplate } from '../lib/ExcelService';
import { uploadExternalData, setRemoteDataSource } from '../lib/api';
import { useBusiness } from '../context/BusinessContext';
import { getAllBusinessTypes } from '../lib/BusinessTypeDetector';
import UniversalDataPanel from '../components/dashboard/UniversalDataPanel';

export default function DataSourceSettings() {
    const [activeTab, setActiveTab] = useState('excel');
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [remoteUrl, setRemoteUrl] = useState('');
    const {
        businessInfo, detectAndSetType, setTypeManually,
        uploadedData, storeUploadedData, clearUploadedData,
    } = useBusiness();

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset input so same file can be re-uploaded
        e.target.value = '';

        try {
            setUploading(true);
            setMessage(null);

            const { metrics, headers, rawTable, chartData, summary, schemaInfo } = await parseMetricsExcel(file);

            // Auto-detect business type
            detectAndSetType(headers, metrics);

            // Store full parsed data for dashboard + inline preview
            storeUploadedData({ rawTable, chartData, summary, schemaInfo, headers });

            // Push to backend (legacy metrics for existing dashboard sections)
            await uploadExternalData(metrics);

            setMessage({
                type: 'success',
                text: `✅ Parsed ${summary.totalRows} rows × ${summary.totalCols} columns from "${file.name}". Dashboard updated.`,
            });
        } catch (err) {
            console.error(err);
            setMessage({
                type: 'error',
                text: err.message || 'Failed to parse file. Please check the format and try again.',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleConnectRemote = async () => {
        if (!remoteUrl) return;
        try {
            setUploading(true);
            setMessage(null);
            await setRemoteDataSource(remoteUrl);
            setMessage({ type: 'success', text: `Connected to ${remoteUrl}. Live data will stream in.` });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to connect to remote URL.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSwitchToMock = async () => {
        try {
            setUploading(true);
            await setRemoteDataSource(null);
            clearUploadedData();
            setMessage({ type: 'success', text: 'Switched back to internal mock simulator.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to reset data source.' });
        } finally {
            setUploading(false);
        }
    };

    const businessTypes = getAllBusinessTypes();

    return (
        <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>Data Source Management</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Upload a CSV/Excel file from any business type. OpsPulse will automatically detect the data structure
                    and render the appropriate charts.
                </p>

                {/* Industry Type Badge + Manual Override */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: businessInfo.color + '18',
                        border: `1px solid ${businessInfo.color}44`,
                        color: businessInfo.color,
                        padding: '6px 14px', borderRadius: 20,
                        fontSize: 13, fontWeight: 600,
                    }}>
                        <span>{businessInfo.emoji}</span>
                        <span>{businessInfo.label}</span>
                        {businessInfo.confidence < 100 && (
                            <span style={{ fontSize: 10, opacity: 0.7 }}>{businessInfo.confidence}% match</span>
                        )}
                    </div>
                    <select
                        onChange={e => setTypeManually(e.target.value)}
                        style={{
                            padding: '6px 12px', borderRadius: 8, fontSize: 12,
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            color: 'var(--text-main)', cursor: 'pointer',
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled>Override industry type…</option>
                        {businessTypes.map(bt => (
                            <option key={bt.value} value={bt.value}>{bt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Message Banner */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        key="msg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            background: message.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                            border: `1px solid ${message.type === 'success' ? '#22c55e44' : '#ef444444'}`,
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            color: message.type === 'success' ? '#22c55e' : '#ef4444',
                        }}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />}
                        <span style={{ fontSize: '13px', fontWeight: 500, flex: 1 }}>{message.text}</span>
                        <button onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, padding: 0, flexShrink: 0 }}>
                            <X size={15} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {[
                    { id: 'excel', label: 'Excel / CSV Import', icon: <FileSpreadsheet size={20} />, desc: 'Upload .xlsx or .csv files' },
                    { id: 'db', label: 'External URL', icon: <Globe size={20} />, desc: 'Connect live JSON/DB' },
                    { id: 'mock', label: 'Mock Simulator', icon: <RefreshCw size={20} />, desc: 'Internal test data' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '18px', borderRadius: '14px',
                            background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                            border: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--border)'}`,
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', gap: '6px',
                            color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)',
                        }}
                    >
                        <div style={{ color: activeTab === tab.id ? 'var(--primary)' : 'inherit' }}>{tab.icon}</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{tab.label}</div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>{tab.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Active tab content */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '18px',
                    padding: '36px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', minHeight: '260px',
                }}
            >
                {activeTab === 'excel' && (
                    <div style={{ maxWidth: '420px', width: '100%' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(79,70,229,0.1)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        }}>
                            <FileSpreadsheet size={28} />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>
                            Import from Excel or CSV
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                            Works with <strong>any business type</strong> — product catalogs, SaaS metrics, sales data, healthcare records,
                            and more. The system auto-detects the structure and renders the right visualizations.
                        </p>

                        {/* Accepted formats hint */}
                        <div style={{
                            display: 'flex', gap: 8, justifyContent: 'center',
                            marginBottom: 20, flexWrap: 'wrap',
                        }}>
                            {['.csv', '.xlsx', '.xls'].map(ext => (
                                <span key={ext} style={{
                                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                    background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
                                    border: '1px solid rgba(99,102,241,0.2)',
                                }}>{ext}</span>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <label
                                className={`btn btn-primary ${uploading ? 'disabled' : ''}`}
                                style={{ cursor: uploading ? 'not-allowed' : 'pointer', gap: '8px', opacity: uploading ? 0.6 : 1 }}
                            >
                                {uploading ? <RefreshCw size={16} className="spin" /> : <Upload size={16} />}
                                {uploading ? 'Parsing…' : 'Upload File'}
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    disabled={uploading}
                                />
                            </label>
                            <button onClick={downloadExcelTemplate} className="btn btn-ghost" style={{ gap: '8px' }}>
                                <Download size={16} /> Template
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'db' && (
                    <div style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(79,70,229,0.1)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        }}>
                            <Globe size={28} />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>Connect Live Data URL</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                            Enter a URL that returns a JSON object with OpsPulse metrics. The backend will fetch this data in real-time.
                        </p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="https://api.yourdb.com/v1/metrics"
                                value={remoteUrl}
                                onChange={(e) => setRemoteUrl(e.target.value)}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'var(--bg-secondary)' }}
                            />
                            <button onClick={handleConnectRemote} className="btn btn-primary" disabled={uploading || !remoteUrl}>
                                {uploading ? <RefreshCw size={16} className="spin" /> : 'Connect'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'mock' && (
                    <div style={{ maxWidth: '380px' }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(79,70,229,0.1)', color: 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                        }}>
                            <RefreshCw size={28} />
                        </div>
                        <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '10px' }}>Reset to Mock Simulator</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                            Use the internal randomized data generator for demonstration and testing.
                        </p>
                        <button onClick={handleSwitchToMock} className="btn btn-outline" style={{ margin: '0 auto' }}>
                            Confirm Reset
                        </button>
                    </div>
                )}
            </motion.div>

            {/* ── Uploaded Data Insights (shown inline after upload) ── */}
            {uploadedData && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginTop: 28 }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: 14,
                    }}>
                        <div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                                📊 Uploaded Data Insights
                            </h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                Auto-generated from your uploaded file — head to the dashboard to see it integrated.
                            </p>
                        </div>
                        <button
                            onClick={clearUploadedData}
                            style={{
                                background: 'none', border: '1px solid var(--border)',
                                borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                                color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
                            }}
                        >
                            <X size={13} /> Clear
                        </button>
                    </div>
                    <UniversalDataPanel
                        rawTable={uploadedData.rawTable}
                        chartData={uploadedData.chartData}
                        summary={uploadedData.summary}
                        schemaInfo={uploadedData.schemaInfo}
                        businessInfo={businessInfo}
                    />
                </motion.div>
            )}
        </div>
    );
}
