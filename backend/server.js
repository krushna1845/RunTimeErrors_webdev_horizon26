const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { advanceTick, getMetrics, setSevereCrisis, setExternalData, setRemoteUrl } = require('./simulators/dataGenerator');
const { calculateStressScore } = require('./engines/stressScore');
const { getAlerts } = require('./engines/alertEngine');
const { getRecommendations } = require('./engines/recommender');
const { getPredictions } = require('./engines/predictor');
const authRoutes = require('./routes/auth');
const { getHistory } = require('./simulators/historyStore');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---

app.use('/api/auth', authRoutes);

// 1. Stress Score
app.get('/api/stress-score', async (req, res) => {
    const businessType = req.query.businessType || 'generic';
    res.json(calculateStressScore(await getMetrics(), businessType));
});

// 2. Metrics
app.get('/api/metrics', async (req, res) => {
    const metrics = await getMetrics();
    res.json({
        sales: {
            current: { revenue: metrics.revenue, orders: metrics.orders, refunds: metrics.refunds },
            history: Array.from({ length: 12 }, (_, i) => ({
                time: `${i + 1}h`,
                revenue: metrics.revenue + (Math.random() * 2000 - 1000),
                orders: Math.max(0, metrics.orders + Math.floor(Math.random() * 10 - 5))
            }))
        },
        inventory: metrics.inventory,
        support: {
            openTickets: metrics.openTickets,
            resolvedTickets: metrics.resolvedTickets,
            avgResponse: parseFloat(metrics.avgResponse.toFixed(1)),
            satisfaction: metrics.satisfaction
        },
        cashflow: {
            current: { inflow: metrics.inflow, outflow: metrics.outflow, balance: metrics.inflow - metrics.outflow },
            history: Array.from({ length: 8 }, (_, i) => ({
                week: `W${i + 1}`,
                inflow: metrics.inflow + (Math.random() * 5000 - 2500),
                outflow: metrics.outflow + (Math.random() * 4000 - 2000),
                balance: (metrics.inflow - metrics.outflow) + (Math.random() * 3000 - 1500)
            }))
        },
        isExternal: metrics.isExternal,
        source: metrics.source
    });
});

// 3. Alerts
app.get('/api/alerts', async (req, res) => {
    res.json(await getAlerts());
});

// 4. Recommendations
app.get('/api/recommendations', async (req, res) => {
    const metrics = await getMetrics();
    res.json(getRecommendations(metrics));
});

// 5. Predictions
app.get('/api/predictions', async (req, res) => {
    const metrics = await getMetrics();
    res.json(getPredictions(metrics));
});

// 6. History
app.get('/api/history', (req, res) => {
    const range = req.query.range || '24h';
    res.json(getHistory(range));
});

// 6. Simulation Controls
app.post('/api/simulate/tick', async (req, res) => {
    advanceTick();
    const metrics = await getMetrics();
    res.json({ success: true, tick: metrics.tickCount });
});

app.post('/api/simulate/crisis', (req, res) => {
    const { active } = req.body;
    setSevereCrisis(!!active);
    res.json({ success: true, crisisMode: active });
});

// 7. Data Source Management
app.post('/api/data-source/upload', (req, res) => {
    const { metrics } = req.body;
    if (!metrics) return res.status(400).json({ error: 'No metrics provided' });

    setExternalData(metrics);
    res.json({ success: true, message: 'Metrics updated from external source' });
});

app.post('/api/data-source/external', (req, res) => {
    const { url } = req.body;
    setRemoteUrl(url || null);
    res.json({ success: true, message: url ? `Connected to ${url}` : 'Switched to mock data' });
});

// 8. Chatbot (Mock Gemini implementation)
app.post('/api/chatbot', async (req, res) => {
    const { message } = req.body;
    const metrics = await getMetrics();
    const score = calculateStressScore(metrics);
    const query = (message || "").toLowerCase();

    // Business themes/keywords
    const businessKeywords = [
        'revenue', 'sales', 'inventory', 'stock', 'cashflow', 'balance',
        'support', 'tickets', 'stress', 'score', 'orders', 'refunds',
        'business', 'crisis', 'anomaly', 'trends', 'recommendations',
        'predictions', 'ops', 'pulse', 'help'
    ];

    const isBusinessCentric = businessKeywords.some(kw => query.includes(kw));

    if (!isBusinessCentric && query.length > 3) {
        return setTimeout(() => {
            res.json({
                reply: "I am specifically designed to assist with your business operations and OpsPulse metrics. Please ask me about your sales, inventory, or current business stress score."
            });
        }, 1000);
    }

    const responses = [
        `Based on the current stress score of ${score.score}, we should prioritize inventory restocking immediately.`,
        "I've analyzed your sales data. A 20% discount on slow-moving items is recommended.",
        "Operational efficiency is within normal ranges, but cashflow is tightening.",
        "I recommend scaling up the support team to handle the current ticket surge."
    ];

    // Simulate thinking
    setTimeout(() => {
        const reply = responses[Math.floor(Math.random() * responses.length)];
        res.json({ reply });
    }, 1000);
});

// 9. Reports Summary
app.get('/api/reports/summary', async (req, res) => {
    const metrics = await getMetrics();
    const score = calculateStressScore(metrics);

    res.json({
        generatedAt: new Date().toISOString(),
        businessHealth: {
            stressScore: score.score,
            status: score.level
        },
        financials: {
            revenue: metrics.revenue,
            orders: metrics.orders,
            refunds: metrics.refunds,
            cashBalance: (metrics.inflow || 0) - (metrics.outflow || 0)
        },
        operations: {
            inventoryLevel: Array.isArray(metrics.inventory) ? metrics.inventory.reduce((sum, item) => sum + (item.stock || 0), 0) : 0,
            openTickets: metrics.openTickets,
            avgResponseTime: metrics.avgResponse
        }
    });
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`⚡ OpsPulse Backend running on http://localhost:${PORT}`);
    // Auto-advance tick every 10 seconds
    setInterval(advanceTick, 10000);
});
