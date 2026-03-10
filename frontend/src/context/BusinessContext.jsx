import { createContext, useContext, useState, useCallback } from 'react';
import { detectBusinessType, getMetricLabel, METRIC_LABELS } from '../lib/BusinessTypeDetector';

const BusinessContext = createContext(null);

export function BusinessProvider({ children }) {
    const [businessType, setBusinessType] = useState('generic');
    const [businessInfo, setBusinessInfo] = useState({
        type: 'generic',
        label: 'Generic Business',
        emoji: '🏢',
        color: '#94a3b8',
        confidence: 100,
    });

    // ── Uploaded data state ─────────────────────────────────────────────────
    const [uploadedData, setUploadedData] = useState(null);
    // Shape: { rawTable, chartData, summary, schemaInfo, headers } | null

    /**
     * Call this after a CSV/Excel file is parsed.
     * Detects business type and stores the full parsed data blob.
     */
    const detectAndSetType = useCallback((headers = [], metricsObj = {}) => {
        const result = detectBusinessType(headers, metricsObj);
        setBusinessType(result.type);
        setBusinessInfo(result);
    }, []);

    /**
     * Store parsed upload data for dashboard rendering.
     */
    const storeUploadedData = useCallback((data) => {
        setUploadedData(data);
    }, []);

    /**
     * Clear the uploaded data (e.g., when switching to mock).
     */
    const clearUploadedData = useCallback(() => {
        setUploadedData(null);
    }, []);

    /**
     * Manually override the business type (e.g. from a dropdown).
     */
    const setTypeManually = useCallback((type) => {
        const known = {
            saas: { type: 'saas', label: 'SaaS', emoji: '💻', color: '#6366f1', confidence: 100 },
            ecommerce: { type: 'ecommerce', label: 'E-Commerce', emoji: '🛒', color: '#f59e0b', confidence: 100 },
            product_catalog: { type: 'product_catalog', label: 'Product Catalog', emoji: '📦', color: '#f59e0b', confidence: 100 },
            retail: { type: 'retail', label: 'Retail', emoji: '🏪', color: '#10b981', confidence: 100 },
            manufacturing: { type: 'manufacturing', label: 'Manufacturing', emoji: '🏭', color: '#ef4444', confidence: 100 },
            hospitality: { type: 'hospitality', label: 'Hospitality', emoji: '🏨', color: '#ec4899', confidence: 100 },
            logistics: { type: 'logistics', label: 'Logistics', emoji: '🚛', color: '#8b5cf6', confidence: 100 },
            healthcare: { type: 'healthcare', label: 'Healthcare', emoji: '🏥', color: '#06b6d4', confidence: 100 },
            generic: { type: 'generic', label: 'Generic Business', emoji: '🏢', color: '#94a3b8', confidence: 100 },
        };
        const info = known[type] || known.generic;
        setBusinessType(info.type);
        setBusinessInfo(info);
    }, []);

    /**
     * Get display label + description for a metric key.
     */
    const label = useCallback((metricKey) => {
        return getMetricLabel(businessType, metricKey);
    }, [businessType]);

    return (
        <BusinessContext.Provider value={{
            businessType,
            businessInfo,
            detectAndSetType,
            setTypeManually,
            label,
            allLabels: METRIC_LABELS[businessType] || METRIC_LABELS.generic,
            // Uploaded data
            uploadedData,
            storeUploadedData,
            clearUploadedData,
        }}>
            {children}
        </BusinessContext.Provider>
    );
}

export function useBusiness() {
    const ctx = useContext(BusinessContext);
    if (!ctx) throw new Error('useBusiness must be used inside <BusinessProvider>');
    return ctx;
}
