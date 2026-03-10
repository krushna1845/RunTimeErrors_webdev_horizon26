const calculateStressScore = (metrics) => {
    if (!metrics) return { score: 0, level: 'healthy', breakdown: {} };

    const salesBaseline = 45000;

    // Normalized indices (0-100)
    const salesDecline = Math.max(0, Math.min(100, ((salesBaseline - (metrics.revenue || 0)) / salesBaseline) * 100));
    const inventoryRisk = (Array.isArray(metrics.inventory) && metrics.inventory.length > 0
        ? (metrics.inventory.filter(i => i.stock < i.threshold).length / metrics.inventory.length) * 100
        : 0);
    const supportIndex = Math.min(100, ((metrics.openTickets || 0) / 50) * 100);
    const cashflowInstability = metrics.outflow ? Math.max(0, Math.min(100, (((metrics.outflow || 0) - (metrics.inflow || 0)) / metrics.outflow) * 100)) : 0;

    const score = Math.round(
        0.40 * salesDecline +
        0.30 * inventoryRisk +
        0.20 * supportIndex +
        0.10 * cashflowInstability
    );

    return {
        score: Math.max(0, Math.min(100, score)),
        breakdown: {
            sales: parseFloat(salesDecline.toFixed(1)),
            inventory: parseFloat(inventoryRisk.toFixed(1)),
            support: parseFloat(supportIndex.toFixed(1)),
            cashflow: parseFloat(cashflowInstability.toFixed(1)),
        },
        level: score < 30 ? 'healthy' : score < 60 ? 'caution' : score < 80 ? 'warning' : 'crisis',
    };
};

module.exports = { calculateStressScore };
