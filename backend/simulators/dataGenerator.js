// In-memory simulator for business metrics
// Supports 'severe_crisis' mode for demonstration.
const axios = require('axios');

let state = {
    isSevereCrisis: false,
    revenue: 45000,
    orders: 142,
    refunds: 8,
    inventory: [
        { product: 'Widget A', stock: 340, threshold: 100 },
        { product: 'Widget B', stock: 78, threshold: 100 },
        { product: 'Gadget X', stock: 12, threshold: 50 },
        { product: 'Gadget Y', stock: 220, threshold: 80 },
        { product: 'Module Z', stock: 5, threshold: 30 },
    ],
    openTickets: 23,
    resolvedTickets: 87,
    avgResponse: 3.2,
    inflow: 52000,
    outflow: 38000,
    tickCount: 0,
};

let externalData = null;
let remoteUrl = null;

const random = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(random(min, max));

const advanceTick = () => {
    state.tickCount++;

    if (state.isSevereCrisis) {
        state.revenue = Math.max(2000, state.revenue * 0.7);
        state.orders = Math.max(5, state.orders * 0.8);
        state.refunds = Math.min(100, state.refunds + randInt(5, 15));
        state.openTickets = Math.min(200, state.openTickets + randInt(10, 30));
        state.avgResponse = Math.min(24, state.avgResponse + random(1, 3));
        state.inflow = Math.max(5000, state.inflow * 0.6);
        state.outflow = Math.min(100000, state.outflow + randInt(5000, 15000));
        state.inventory.forEach(item => {
            item.stock = Math.max(0, item.stock - randInt(20, 50));
        });
    } else {
        state.revenue = Math.max(10000, state.revenue + random(-3000, 4000));
        state.orders = Math.max(10, state.orders + randInt(-12, 18));
        state.refunds = Math.max(0, state.refunds + randInt(-3, 5));
        state.openTickets = Math.max(0, state.openTickets + randInt(-5, 8));
        state.resolvedTickets = state.resolvedTickets + randInt(2, 10);
        state.avgResponse = Math.max(0.5, Math.min(10, state.avgResponse + random(-0.5, 0.8)));
        state.inflow = Math.max(10000, state.inflow + random(-5000, 8000));
        state.outflow = Math.max(5000, state.outflow + random(-4000, 6000));
        state.inventory.forEach(item => {
            item.stock = Math.max(0, item.stock + randInt(-10, 5));
        });
    }
};

const setSevereCrisis = (active) => {
    state.isSevereCrisis = active;
};

const setExternalData = (data) => {
    externalData = data;
    remoteUrl = null; // Reset remote if manual upload is used
};

const setRemoteUrl = (url) => {
    remoteUrl = url;
    externalData = null;
};

const getMetrics = async () => {
    if (remoteUrl) {
        try {
            const response = await axios.get(remoteUrl, { timeout: 3000 });
            return { ...state, ...response.data, isExternal: true, source: 'Remote DB' };
        } catch (err) {
            console.error('Remote fetch failed, falling back to simulator:', err.message);
        }
    }

    if (externalData) {
        return { ...state, ...externalData, isExternal: true, source: 'Excel Import' };
    }

    return { ...state, isExternal: false, source: 'Simulator' };
};

module.exports = { advanceTick, getMetrics, setSevereCrisis, setExternalData, setRemoteUrl };
