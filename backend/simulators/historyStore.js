/**
 * historyStore.js
 * Rolling in-memory time-series store for business metric snapshots.
 * Stores up to 365 daily snapshots, 90 hourly snapshots, etc.
 * Each snapshot is timestamped with ISO string.
 */

const MAX_SNAPSHOTS = 365 * 24; // up to 1 year of hourly snapshots

const snapshots = []; // { timestamp, revenue, orders, refunds, openTickets, inflow, outflow, stressScore, level }

/**
 * Push a new snapshot into the store.
 */
const pushSnapshot = (metrics, stressResult) => {
    snapshots.push({
        timestamp: new Date().toISOString(),
        revenue: Math.round(metrics.revenue || 0),
        orders: Math.round(metrics.orders || 0),
        refunds: Math.round(metrics.refunds || 0),
        openTickets: Math.round(metrics.openTickets || 0),
        inflow: Math.round(metrics.inflow || 0),
        outflow: Math.round(metrics.outflow || 0),
        stressScore: stressResult ? stressResult.score : 0,
        level: stressResult ? stressResult.level : 'healthy',
    });

    // Trim to max size
    if (snapshots.length > MAX_SNAPSHOTS) {
        snapshots.splice(0, snapshots.length - MAX_SNAPSHOTS);
    }
};

/**
 * Get snapshots filtered by time range.
 * range: '24h' | '7d' | '30d' | '12m' | '1y'
 */
const getHistory = (range = '24h') => {
    const now = Date.now();
    let cutoffMs;

    switch (range) {
        case '1h': cutoffMs = 60 * 60 * 1000; break;
        case '24h': cutoffMs = 24 * 60 * 60 * 1000; break;
        case '7d': cutoffMs = 7 * 24 * 60 * 60 * 1000; break;
        case '30d': cutoffMs = 30 * 24 * 60 * 60 * 1000; break;
        case '12m':
        case '1y': cutoffMs = 365 * 24 * 60 * 60 * 1000; break;
        default: cutoffMs = 24 * 60 * 60 * 1000;
    }

    const cutoff = now - cutoffMs;
    const filtered = snapshots.filter(s => new Date(s.timestamp).getTime() >= cutoff);

    // If we don't have enough real history yet, synthesize some demo data
    if (filtered.length < 10) {
        return synthesizeDemoHistory(range);
    }

    return filtered;
};

/**
 * Synthesize plausible demo history when the app is freshly started
 * and doesn't have enough real ticks yet.
 */
const synthesizeDemoHistory = (range) => {
    const now = Date.now();
    let points, intervalMs, baseRevenue;

    switch (range) {
        case '1h': points = 12; intervalMs = 5 * 60 * 1000; baseRevenue = 45000; break;
        case '24h': points = 24; intervalMs = 60 * 60 * 1000; baseRevenue = 45000; break;
        case '7d': points = 28; intervalMs = 6 * 60 * 60 * 1000; baseRevenue = 44000; break;
        case '30d': points = 30; intervalMs = 24 * 60 * 60 * 1000; baseRevenue = 43000; break;
        case '12m':
        case '1y': points = 12; intervalMs = 30 * 24 * 60 * 60 * 1000; baseRevenue = 40000; break;
        default: points = 24; intervalMs = 60 * 60 * 1000; baseRevenue = 45000;
    }

    const result = [];
    let revenue = baseRevenue;

    for (let i = points - 1; i >= 0; i--) {
        revenue = Math.max(10000, revenue + (Math.random() * 6000 - 2500));
        const orders = Math.max(10, Math.round(80 + Math.random() * 80));
        const refunds = Math.max(0, Math.round(5 + Math.random() * 10));
        const openTickets = Math.max(0, Math.round(10 + Math.random() * 40));
        const inflow = Math.max(10000, revenue * 1.1 + Math.random() * 5000);
        const outflow = Math.max(5000, revenue * 0.85 + Math.random() * 4000);
        const stressScore = Math.round(Math.random() * 50); // mostly healthy in history

        result.push({
            timestamp: new Date(now - i * intervalMs).toISOString(),
            revenue: Math.round(revenue),
            orders,
            refunds,
            openTickets,
            inflow: Math.round(inflow),
            outflow: Math.round(outflow),
            stressScore,
            level: stressScore < 30 ? 'healthy' : stressScore < 60 ? 'caution' : stressScore < 80 ? 'warning' : 'crisis',
        });
    }

    return result;
};

module.exports = { pushSnapshot, getHistory };
