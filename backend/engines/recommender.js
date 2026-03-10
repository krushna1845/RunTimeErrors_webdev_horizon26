const { calculateStressScore } = require('./stressScore');

const getRecommendations = (metrics) => {
    if (!metrics) return [];
    const score = calculateStressScore(metrics);
    const recs = [];

    // Sales-based recommendations
    if (score.breakdown.sales > 40) {
        recs.push({
            id: 'sales-1',
            icon: '🔥',
            title: 'Urgent: Revenue Recovery',
            detail: 'Revenue is significantly below target. Consider an immediate 20% site-wide markdown.',
            priority: 'high'
        });
    } else if (score.breakdown.sales > 20) {
        recs.push({
            id: 'sales-2',
            icon: '📢',
            title: 'Boost Customer Acquisition',
            detail: 'Sales growth is slowing. Increase ad spend on top-performing social channels.',
            priority: 'medium'
        });
    }

    // Inventory-based recommendations
    const lowStockCount = metrics.inventory ? metrics.inventory.filter(i => i.stock < i.threshold).length : 0;
    if (lowStockCount > 2) {
        recs.push({
            id: 'inv-1',
            icon: '📦',
            title: 'Critical Stock Shortage',
            detail: `${lowStockCount} items are below safety levels. Expedite restock from secondary suppliers.`,
            priority: 'high'
        });
    } else if (lowStockCount > 0) {
        recs.push({
            id: 'inv-2',
            icon: '🛒',
            title: 'Optimise Inventory Levels',
            detail: 'Some items are nearing threshold. Prepare purchase orders to avoid stockouts.',
            priority: 'low'
        });
    }

    // Support-based recommendations
    if (metrics.avgResponse > 5) {
        recs.push({
            id: 'sup-1',
            icon: '🎧',
            title: 'Critical Support Delay',
            detail: `Average response time peaked at ${metrics.avgResponse.toFixed(1)}h. Deploy emergency support shifts.`,
            priority: 'high'
        });
    } else if (metrics.openTickets > 50) {
        recs.push({
            id: 'sup-2',
            icon: '🤖',
            title: 'Enable AI Ticket Deflection',
            detail: 'Ticket volume is high. Activate automated FAQ responses to reduce load.',
            priority: 'medium'
        });
    }

    if (metrics.satisfaction < 3.5) {
        recs.push({
            id: 'sup-3',
            icon: '⭐',
            title: 'Improve Customer Experience',
            detail: `Satisfaction has dropped to ${metrics.satisfaction}. Review recent negative feedback entries.`,
            priority: 'high'
        });
    }

    // Cashflow-based
    const burnRate = metrics.outflow - metrics.inflow;
    if (burnRate > 5000) {
        recs.push({
            id: 'cash-1',
            icon: '💸',
            title: 'Negative Cash Position',
            detail: 'Monthly outflow exceeds inflow. Reduce non-essential operational expenditure.',
            priority: 'medium'
        });
    }

    // Default if nothing else
    if (recs.length === 0) {
        recs.push({
            id: 'gen-1',
            icon: '✅',
            title: 'Performance On Track',
            detail: 'All metrics are healthy. Focus on long-term strategy and team development.',
            priority: 'low'
        });
    }

    return recs;
};

module.exports = { getRecommendations };
