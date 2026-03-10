const { calculateStressScore } = require('./stressScore');

const getRecommendations = (metrics) => {
    if (!metrics) return [];
    const score = calculateStressScore(metrics);
    const recs = [];

    if (score.breakdown.sales > 30) {
        recs.push({
            id: 1,
            icon: '📢',
            title: 'Launch Flash Promotion',
            detail: 'Sales are down. A 24-hour revenue recovery campaign is suggested.',
            priority: 'high'
        });
    }

    if (score.breakdown.inventory > 40) {
        recs.push({
            id: 2,
            icon: '📦',
            title: 'Expedite Restock Orders',
            detail: 'Multiple products are critical. Contact suppliers for prioritized fulfillment.',
            priority: 'high'
        });
    }

    if (score.breakdown.support > 40) {
        recs.push({
            id: 3,
            icon: '🎧',
            title: 'Scale Support Bandwidth',
            detail: 'Unusually high ticket volume. Consider temporary staff or AI deflection.',
            priority: 'medium'
        });
    }

    recs.push({
        id: 4,
        icon: '📊',
        title: 'Review Weekly Forecast',
        detail: 'Risk levels are trending upward. Validate next-week inventory projections.',
        priority: 'low'
    });

    return recs;
};

module.exports = { getRecommendations };
