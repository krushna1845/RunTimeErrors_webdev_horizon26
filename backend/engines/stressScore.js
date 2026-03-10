/**
 * stressScore.js
 * Calculates the Business Stress Score (0–100) using weighted metrics.
 * Supports industry-specific weight profiles.
 */

const WEIGHT_PROFILES = {
    // E-commerce: Inventory and sales are both critical
    ecommerce: { sales: 0.40, inventory: 0.35, support: 0.10, cashflow: 0.15 },
    // SaaS: Revenue (MRR) and support are key; inventory less relevant
    saas: { sales: 0.45, inventory: 0.05, support: 0.30, cashflow: 0.20 },
    // Retail: Inventory and sales equally important
    retail: { sales: 0.35, inventory: 0.30, support: 0.15, cashflow: 0.20 },
    // Manufacturing: Production/inventory dominates
    manufacturing: { sales: 0.20, inventory: 0.40, support: 0.20, cashflow: 0.20 },
    // Generic / fallback
    generic: { sales: 0.40, inventory: 0.30, support: 0.20, cashflow: 0.10 },
};

const calculateStressScore = (metrics, businessType = 'generic') => {
    if (!metrics) return { score: 0, level: 'healthy', breakdown: {}, businessType };

    const weights = WEIGHT_PROFILES[businessType] || WEIGHT_PROFILES.generic;
    const salesBaseline = 45000;

    // ── Sub-indices (0–100 each) ──────────────────────────────────────────────

    // 1. Sales Decline: how far below the baseline revenue is
    const salesDecline = Math.max(0, Math.min(100,
        ((salesBaseline - (metrics.revenue || 0)) / salesBaseline) * 100
    ));

    // 2. Inventory Risk: % of products currently below their restock threshold
    const inventoryRisk = (
        Array.isArray(metrics.inventory) && metrics.inventory.length > 0
            ? (metrics.inventory.filter(i => i.stock < i.threshold).length / metrics.inventory.length) * 100
            : 0
    );

    // 3. Support Index: ticket load relative to a safe maximum of 50 open tickets
    const supportIndex = Math.min(100, ((metrics.openTickets || 0) / 50) * 100);

    // 4. Cashflow Instability: how much outflow exceeds inflow (as a % of outflow)
    const cashflowInstability = metrics.outflow
        ? Math.max(0, Math.min(100,
            (((metrics.outflow || 0) - (metrics.inflow || 0)) / metrics.outflow) * 100
        ))
        : 0;

    // ── Weighted Final Score ──────────────────────────────────────────────────
    const score = Math.round(
        weights.sales * salesDecline +
        weights.inventory * inventoryRisk +
        weights.support * supportIndex +
        weights.cashflow * cashflowInstability
    );

    return {
        score: Math.max(0, Math.min(100, score)),
        businessType,
        weights,
        breakdown: {
            sales: parseFloat(salesDecline.toFixed(1)),
            inventory: parseFloat(inventoryRisk.toFixed(1)),
            support: parseFloat(supportIndex.toFixed(1)),
            cashflow: parseFloat(cashflowInstability.toFixed(1)),
        },
        level: score < 30 ? 'healthy' : score < 60 ? 'caution' : score < 80 ? 'warning' : 'crisis',
    };
};

module.exports = { calculateStressScore, WEIGHT_PROFILES };
