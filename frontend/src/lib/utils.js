export const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const formatNumber = (n) =>
    new Intl.NumberFormat('en-US').format(Math.round(n));

export const formatPercent = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

export const scoreMeta = (level) => {
    switch (level) {
        case 'healthy': return { color: '#10b981', label: 'Healthy', badge: 'badge-green' };
        case 'caution': return { color: '#f59e0b', label: 'Caution', badge: 'badge-yellow' };
        case 'warning': return { color: '#f97316', label: 'Warning', badge: 'badge-orange' };
        case 'crisis': return { color: '#ef4444', label: 'Crisis', badge: 'badge-red' };
        default: return { color: '#6366f1', label: 'Unknown', badge: 'badge-accent' };
    }
};

export const alertMeta = (type) => {
    switch (type) {
        case 'crisis': return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: '🔴' };
        case 'opportunity': return { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: '🟢' };
        case 'anomaly': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: '🟡' };
        default: return { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', icon: '🔵' };
    }
};

export const timeAgo = (ms) => {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    return `${h}h ago`;
};
