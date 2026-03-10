const { calculateStressScore } = require('./stressScore');
const { getMetrics } = require('../simulators/dataGenerator');

const getAlerts = async () => {
    const metrics = await getMetrics(); // ✅ await so we get real data
    const score = calculateStressScore(metrics); // ✅ pass metrics in
    const alerts = [];

    // 1. Critical stress score
    if (score.score > 80) {
        alerts.push({
            id: Date.now() + 1,
            type: 'crisis',
            title: 'CRITICAL BUSINESS STRESS',
            message: `Stress score is at ${score.score}/100. Immediate intervention required.`,
            severity: 'critical',
            time: 'Just now',
        });
    }

    // 2. Severe sales slump
    if ((metrics.revenue || 0) < 30000) {
        alerts.push({
            id: Date.now() + 2,
            type: 'crisis',
            title: 'Severe Sales Slump',
            message: `Revenue ₹${Math.round(metrics.revenue || 0).toLocaleString()} is critically below the ₹30,000 safety threshold.`,
            severity: 'high',
            time: 'Just now',
        });
    }

    // 3. Inventory stockouts
    if (Array.isArray(metrics.inventory) && metrics.inventory.some(i => i.stock < i.threshold)) {
        const critical = metrics.inventory.filter(i => i.stock < i.threshold).map(i => i.product).join(', ');
        alerts.push({
            id: Date.now() + 3,
            type: 'crisis',
            title: 'Stockouts Imminent',
            message: `Critical inventory levels for: ${critical}.`,
            severity: 'high',
            time: 'Just now',
        });
    }

    // 4. Refund spike (absolute count)
    if ((metrics.refunds || 0) > 15) {
        alerts.push({
            id: Date.now() + 4,
            type: 'anomaly',
            title: 'Spike in Refunds',
            message: `${metrics.refunds} refunds detected — abnormal volume. Investigate product quality or fraud.`,
            severity: 'medium',
            time: 'Just now',
        });
    }

    // 5. Refund rate % (refunds / orders > 10%)
    const refundRate = metrics.orders > 0 ? (metrics.refunds / metrics.orders) * 100 : 0;
    if (refundRate > 10) {
        alerts.push({
            id: Date.now() + 5,
            type: 'anomaly',
            title: 'High Refund Rate',
            message: `Refund rate is ${refundRate.toFixed(1)}% — exceeds the 10% safety threshold.`,
            severity: 'high',
            time: 'Just now',
        });
    }

    // 6. Cash runway alert — outflow > inflow by > 30%
    const cashBurn = (metrics.outflow || 0) - (metrics.inflow || 0);
    if (cashBurn > 0 && metrics.inflow > 0) {
        const runwayDays = Math.floor((metrics.inflow / (metrics.outflow / 30)));
        if (runwayDays < 30) {
            alerts.push({
                id: Date.now() + 6,
                type: 'crisis',
                title: 'Critical Cash Runway',
                message: `Estimated cash runway is only ~${runwayDays} days. Outflow exceeds inflow by ₹${Math.round(cashBurn).toLocaleString()}.`,
                severity: 'critical',
                time: 'Just now',
            });
        }
    }

    // 7. SLA breach — avg response time > 6 hours
    if ((metrics.avgResponse || 0) > 6) {
        alerts.push({
            id: Date.now() + 7,
            type: 'warning',
            title: 'Support SLA Breach',
            message: `Average response time is ${metrics.avgResponse.toFixed(1)}h — exceeds 6-hour SLA. Customer satisfaction at risk.`,
            severity: 'medium',
            time: 'Just now',
        });
    }

    // 8. High open ticket volume
    if ((metrics.openTickets || 0) > 80) {
        alerts.push({
            id: Date.now() + 8,
            type: 'warning',
            title: 'Ticket Queue Overload',
            message: `${metrics.openTickets} open tickets in queue. Support team may be overwhelmed.`,
            severity: 'medium',
            time: 'Just now',
        });
    }

    // Stable operations — only if no alerts
    if (alerts.length === 0) {
        alerts.push({
            id: Date.now() + 9,
            type: 'opportunity',
            title: 'Stable Operations',
            message: 'No significant risks detected. All metrics within safe thresholds.',
            severity: 'low',
            time: 'Just now',
        });
    }

    return alerts;
};

module.exports = { getAlerts };
