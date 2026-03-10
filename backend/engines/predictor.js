const { getMetrics } = require('../simulators/dataGenerator');

const getPredictions = (metrics) => {
    if (!metrics) return [];

    return Array.from({ length: 7 }, (_, i) => {
        const day = i + 1;
        // Simple projection logic: if severe crisis, risk trends upward faster.
        const baseRisk = metrics.isSevereCrisis ? 60 : 25;
        const growth = metrics.isSevereCrisis ? 8 : 2;

        return {
            day: `Day ${day}`,
            risk: Math.min(100, Math.max(0, baseRisk + (day * growth) + (Math.random() * 10 - 5))),
            revenue: Math.max(2000, metrics.revenue + (Math.random() * 5000 - 2500))
        };
    });
};

module.exports = { getPredictions };
