const { calculateStressScore } = require('./stressScore');
const { getMetrics } = require('../simulators/dataGenerator');

const getAlerts = () => {
    const score = calculateStressScore();
    const metrics = getMetrics();
    const alerts = [];

    if (score.score > 80) {
        alerts.push({
            id: Date.now() + 1,
            type: 'crisis',
            title: 'CRITICAL BUSINESS STRESS',
            message: `Score is at ${score.score}. Immediate intervention required.`,
            severity: 'critical',
            time: 'Just now',
        });
    }

    if (metrics.revenue < 30000) {
        alerts.push({
            id: Date.now() + 2,
            type: 'crisis',
            title: 'Severe Sales Slump',
            message: `Revenue has dropped significantly below the safety threshold.`,
            severity: 'high',
            time: 'Just now',
        });
    }

    if (metrics.inventory.some(i => i.stock < i.threshold)) {
        alerts.push({
            id: Date.now() + 3,
            type: 'crisis',
            title: 'Stockouts Imminent',
            message: 'Critical inventory levels reached for several SKUs.',
            severity: 'high',
            time: 'Just now',
        });
    }

    if (metrics.refunds > 15) {
        alerts.push({
            id: Date.now() + 4,
            type: 'anomaly',
            title: 'Spike in Refunds',
            message: 'Abnormal refund volume detected.',
            severity: 'medium',
            time: 'Just now',
        });
    }

    if (alerts.length === 0) {
        alerts.push({
            id: Date.now() + 5,
            type: 'opportunity',
            title: 'Stable Operations',
            message: 'No significant risks detected in current data stream.',
            severity: 'low',
            time: 'Just now',
        });
    }

    return alerts;
};

module.exports = { getAlerts };
