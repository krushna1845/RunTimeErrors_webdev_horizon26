import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, FileSpreadsheet, Globe, Upload, Download, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { parseMetricsExcel, downloadExcelTemplate } from '../lib/ExcelService';
import { uploadExternalData, setRemoteDataSource } from '../lib/api';

export default function DataSourceSettings() {
    const [activeTab, setActiveTab] = useState('excel'); // 'excel' | 'db' | 'mock'
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [remoteUrl, setRemoteUrl] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setMessage(null);
            const metrics = await parseMetricsExcel(file);
            await uploadExternalData(metrics);
            setMessage({ type: 'success', text: 'Excel data imported successfully! Dashboard is now reflecting these metrics.' });
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to parse Excel file. Please ensure it follows the template.' });
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
            setMessage({ type: 'success', text: `Successfully connected to ${remoteUrl}. Data will be fetched live.` });
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
            setMessage({ type: 'success', text: 'Switched back to internal mock simulator.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to reset data source.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Data Source Management</h2>
                <p style={{ color: 'var(--text-muted)' }}>Configure how OpsPulse receives business metrics. Switch between live simulation, Excel imports, or external database URLs.</p>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${message.type === 'success' ? 'var(--green)' : 'var(--red)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: message.type === 'success' ? 'var(--green)' : 'var(--red)'
                    }}
                >
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{message.text}</span>
                </motion.div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                {[
                    { id: 'excel', label: 'Excel / CSV Import', icon: <FileSpreadsheet size={20} />, desc: 'Upload .xlsx or .csv files' },
                    { id: 'db', label: 'External URL', icon: <Globe size={20} />, desc: 'Connect live JSON/DB' },
                    { id: 'mock', label: 'Mock Simulator', icon: <RefreshCw size={20} />, desc: 'Internal test data' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '20px',
                            borderRadius: '16px',
                            background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                            border: `2px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--border)'}`,
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-muted)'
                        }}
                    >
                        <div style={{ color: activeTab === tab.id ? 'var(--primary)' : 'inherit' }}>{tab.icon}</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '15px' }}>{tab.label}</div>
                            <div style={{ fontSize: '12px', opacity: 0.8 }}>{tab.desc}</div>
                        </div>
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '40px',
                    minHeight: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}
            >
                {activeTab === 'excel' && (
                    <div style={{ maxWidth: '400px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <FileSpreadsheet size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Import Metrics from Excel or CSV</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                            Download the template to see how to format your data. Upload a filled <strong>.xlsx</strong> or <strong>.csv</strong> file to override the current dashboard metrics.
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <label className={`btn btn-primary ${uploading ? 'disabled' : ''}`} style={{ cursor: 'pointer', gap: '8px' }}>
                                <Upload size={18} />
                                {uploading ? 'Processing...' : 'Upload File'}
                                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                            </label>
                            <button onClick={downloadExcelTemplate} className="btn btn-ghost" style={{ gap: '8px' }}>
                                <Download size={18} /> Template
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'db' && (
                    <div style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <Globe size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Connect Live Data URL</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                            Enter a URL that returns a JSON object matching the OpsPulse metrics schema. The backend will fetch this data in real-time.
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
                                {uploading ? <RefreshCw size={18} className="spin" /> : 'Connect'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'mock' && (
                    <div style={{ maxWidth: '400px' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                            <RefreshCw size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Reset to Mock Simulator</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                            Use the internal randomized data generator for demonstration and testing purposes.
                        </p>
                        <button onClick={handleSwitchToMock} className="btn btn-outline" style={{ margin: '0 auto' }}>
                            Confirm Reset
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
