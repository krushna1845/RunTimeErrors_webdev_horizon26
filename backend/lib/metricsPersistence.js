const supabase = require('../lib/supabase');
const { calculateStressScore } = require('../engines/stressScore');
const { getMetrics } = require('../simulators/dataGenerator');

/**
 * Persists the current business state to Supabase history.
 * Call this periodically or on every simulator tick.
 */
const persistMetrics = async (userId) => {
    const metrics = getMetrics();
    const scoreData = calculateStressScore();

    const { error } = await supabase
        .from('metrics_history')
        .insert([{
            user_id: userId,
            revenue: metrics.revenue,
            orders: metrics.orders,
            refunds: metrics.refunds,
            inventory_risk_count: metrics.inventory.filter(i => i.stock < i.threshold).length,
            support_ticket_count: metrics.openTickets,
            stress_score: scoreData.score
        }]);

    if (error) console.error('Failed to persist metrics to Supabase:', error.message);
};

module.exports = { persistMetrics };
