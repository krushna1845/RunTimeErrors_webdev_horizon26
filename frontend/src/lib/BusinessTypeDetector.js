/**
 * BusinessTypeDetector.js
 * Scans CSV/Excel column headers and metric keys to detect the business type.
 * Returns one of: 'ecommerce' | 'saas' | 'retail' | 'manufacturing' | 
 *                 'product_catalog' | 'hospitality' | 'logistics' | 'healthcare' | 'generic'
 */

// ─────────────────────────────────────────────────────────────────────────────
// Industry Fingerprints
// ─────────────────────────────────────────────────────────────────────────────

const FINGERPRINTS = {
    saas: {
        keywords: [
            'mrr', 'arr', 'churn', 'dau', 'mau', 'ltv', 'cac', 'arpu',
            'monthly recurring', 'annual recurring', 'active users', 'trial',
            'subscription', 'seats', 'license', 'plan', 'tier', 'upgrade',
        ],
        label: 'SaaS',
        emoji: '💻',
        color: '#6366f1',
    },
    ecommerce: {
        keywords: [
            'gmv', 'cart', 'sku', 'shipping', 'fulfilment', 'fulfillment',
            'abandonment', 'aov', 'average order value', 'returns rate',
            'checkout', 'listing', 'seller', 'marketplace', 'coupon', 'voucher',
        ],
        label: 'E-Commerce',
        emoji: '🛒',
        color: '#f59e0b',
    },
    product_catalog: {
        // Matches product/inventory data tables (e.g. ProductID, Name, Category, Price, Stock)
        keywords: [
            'productid', 'product id', 'product name', 'product_id', 'sku',
            'stock', 'inventory', 'category', 'price', 'unit price', 'item',
            'catalogue', 'catalog', 'quantity', 'qty', 'barcode', 'upc',
        ],
        label: 'Product Catalog',
        emoji: '📦',
        color: '#f59e0b',
    },
    retail: {
        keywords: [
            'footfall', 'basket', 'shrinkage', 'pos', 'point of sale',
            'walk-in', 'walkthrough', 'store', 'branch', 'floor', 'retail',
            'shoppers', 'cashier', 'till',
        ],
        label: 'Retail',
        emoji: '🏪',
        color: '#10b981',
    },
    manufacturing: {
        keywords: [
            'oee', 'defect', 'downtime', 'yield', 'throughput', 'shift',
            'machine', 'production', 'assembly', 'scrap', 'plant',
            'unit produced', 'rejection', 'batch', 'raw material', 'cycle time',
        ],
        label: 'Manufacturing',
        emoji: '🏭',
        color: '#ef4444',
    },
    hospitality: {
        keywords: [
            'room', 'booking', 'occupancy', 'guest', 'check-in', 'check-out',
            'nightly', 'reservation', 'hotel', 'hostel', 'revpar', 'adr',
            'amenity', 'housekeeping', 'table', 'cover', 'menu',
        ],
        label: 'Hospitality',
        emoji: '🏨',
        color: '#ec4899',
    },
    logistics: {
        keywords: [
            'shipment', 'delivery', 'route', 'warehouse', 'load', 'dispatch',
            'freight', 'truck', 'driver', 'cargo', 'tracking', 'eta', 'pickup',
            'consignment', 'weight', 'pallet', 'fleet',
        ],
        label: 'Logistics',
        emoji: '🚛',
        color: '#8b5cf6',
    },
    healthcare: {
        keywords: [
            'patient', 'diagnosis', 'bed', 'admission', 'discharge',
            'appointment', 'prescription', 'doctor', 'nurse', 'clinic',
            'procedure', 'lab', 'test', 'consultation', 'ward', 'icu',
        ],
        label: 'Healthcare',
        emoji: '🏥',
        color: '#06b6d4',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Detection Logic
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detect business type from column headers and/or metric keys.
 * @param {string[]} headers
 * @param {object} [metricsObj]
 * @returns {{ type, label, emoji, color, confidence }}
 */
export function detectBusinessType(headers = [], metricsObj = {}) {
    const allKeys = [
        ...headers.map(h => h.toLowerCase().trim()),
        ...Object.keys(metricsObj).map(k => k.toLowerCase().trim()),
    ];

    const allText = allKeys.join(' ');

    const scores = {};
    for (const [type, { keywords }] of Object.entries(FINGERPRINTS)) {
        scores[type] = keywords.filter(kw => allText.includes(kw)).length;
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [topType, topScore] = sorted[0];

    if (topScore > 0) {
        const { label, emoji, color } = FINGERPRINTS[topType];
        return {
            type: topType,
            label,
            emoji,
            color,
            confidence: Math.min(100, topScore * 20), // 1 match = 20%, 5+ = 100%
        };
    }

    return {
        type: 'generic',
        label: 'Generic Business',
        emoji: '🏢',
        color: '#94a3b8',
        confidence: 100,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Metric Label Maps
// ─────────────────────────────────────────────────────────────────────────────

export const METRIC_LABELS = {
    saas: {
        revenue: { label: 'MRR', desc: 'Monthly Recurring Revenue' },
        orders: { label: 'New Signups', desc: 'New subscriptions this month' },
        refunds: { label: 'Churned Users', desc: 'Cancelled subscriptions' },
        openTickets: { label: 'Support Tickets', desc: 'Open support requests' },
        inflow: { label: 'Subscription Revenue', desc: 'Incoming subscription payments' },
        outflow: { label: 'Infrastructure Cost', desc: 'Server and ops expenses' },
        inventoryRisk: { label: 'Churn Risk', desc: '% of at-risk accounts' },
    },
    ecommerce: {
        revenue: { label: 'GMV', desc: 'Gross Merchandise Value' },
        orders: { label: 'Orders Placed', desc: 'Total orders in period' },
        refunds: { label: 'Returns', desc: 'Returned / refunded orders' },
        openTickets: { label: 'Open Complaints', desc: 'Pending customer complaints' },
        inflow: { label: 'Cash Collected', desc: 'Payments received' },
        outflow: { label: 'Fulfilment Cost', desc: 'Shipping and warehouse spend' },
        inventoryRisk: { label: 'Stockout Rate', desc: '% of SKUs below safety stock' },
    },
    product_catalog: {
        revenue: { label: 'Total Value', desc: 'Sum of product prices' },
        orders: { label: 'Products', desc: 'Number of catalog items' },
        refunds: { label: 'Low Stock Items', desc: 'Items below threshold' },
        openTickets: { label: 'Categories', desc: 'Product categories' },
        inflow: { label: 'Avg Price', desc: 'Average unit price' },
        outflow: { label: 'Total Stock', desc: 'Total units in inventory' },
        inventoryRisk: { label: 'Stockout Risk', desc: '% of items with low stock' },
    },
    retail: {
        revenue: { label: 'Daily Sales', desc: 'Total point-of-sale revenue' },
        orders: { label: 'Transactions', desc: 'Number of POS transactions' },
        refunds: { label: 'Refunds', desc: 'Returned items' },
        openTickets: { label: 'Complaints', desc: 'Unresolved customer issues' },
        inflow: { label: 'Cash In', desc: 'Revenue received' },
        outflow: { label: 'Operating Cost', desc: 'Store operating expenses' },
        inventoryRisk: { label: 'Shrinkage Risk', desc: '% of products below threshold' },
    },
    manufacturing: {
        revenue: { label: 'Production Value', desc: 'Value of goods produced' },
        orders: { label: 'Units Produced', desc: 'Total units manufactured' },
        refunds: { label: 'Rejected Units', desc: 'Defective / rejected output' },
        openTickets: { label: 'Open Work Orders', desc: 'Pending maintenance/repair orders' },
        inflow: { label: 'Revenue In', desc: 'Incoming payments' },
        outflow: { label: 'Production Cost', desc: 'Raw material and labour cost' },
        inventoryRisk: { label: 'Supply Risk', desc: '% of raw materials below threshold' },
    },
    hospitality: {
        revenue: { label: 'RevPAR', desc: 'Revenue per available room' },
        orders: { label: 'Bookings', desc: 'Total reservations' },
        refunds: { label: 'Cancellations', desc: 'Cancelled bookings' },
        openTickets: { label: 'Guest Requests', desc: 'Pending guest requests' },
        inflow: { label: 'Booking Revenue', desc: 'Total booking payments' },
        outflow: { label: 'Operating Cost', desc: 'Housekeeping and ops' },
        inventoryRisk: { label: 'Availability Risk', desc: '% of rooms at risk' },
    },
    logistics: {
        revenue: { label: 'Freight Value', desc: 'Total freight revenue' },
        orders: { label: 'Shipments', desc: 'Total shipments dispatched' },
        refunds: { label: 'Failed Deliveries', desc: 'Undelivered shipments' },
        openTickets: { label: 'Open Issues', desc: 'Pending delivery issues' },
        inflow: { label: 'Revenue In', desc: 'Freight revenue received' },
        outflow: { label: 'Fuel & Ops Cost', desc: 'Fleet and fuel expenses' },
        inventoryRisk: { label: 'Delay Risk', desc: '% of shipments at risk of delay' },
    },
    healthcare: {
        revenue: { label: 'Billing Revenue', desc: 'Total billing and collections' },
        orders: { label: 'Appointments', desc: 'Total patient appointments' },
        refunds: { label: 'Discharges', desc: 'Patients discharged' },
        openTickets: { label: 'Pending Cases', desc: 'Open patient cases' },
        inflow: { label: 'Collections', desc: 'Insurance and patient payments' },
        outflow: { label: 'Operating Cost', desc: 'Staff and supplies cost' },
        inventoryRisk: { label: 'Bed Capacity Risk', desc: '% of beds at capacity' },
    },
    generic: {
        revenue: { label: 'Revenue', desc: 'Total revenue' },
        orders: { label: 'Orders', desc: 'Total orders' },
        refunds: { label: 'Refunds', desc: 'Total refunds' },
        openTickets: { label: 'Open Tickets', desc: 'Support tickets open' },
        inflow: { label: 'Inflow', desc: 'Cash inflow' },
        outflow: { label: 'Outflow', desc: 'Cash outflow' },
        inventoryRisk: { label: 'Inventory Risk', desc: '% below threshold' },
    },
};

/**
 * Get the display label for a given metric key given a business type.
 */
export function getMetricLabel(type, metricKey) {
    const map = METRIC_LABELS[type] || METRIC_LABELS.generic;
    return map[metricKey] || { label: metricKey, desc: '' };
}

/**
 * Return all known business types for dropdown menus.
 */
export function getAllBusinessTypes() {
    return [
        { value: 'generic', label: '🏢 Generic Business' },
        { value: 'saas', label: '💻 SaaS' },
        { value: 'ecommerce', label: '🛒 E-Commerce' },
        { value: 'product_catalog', label: '📦 Product Catalog' },
        { value: 'retail', label: '🏪 Retail' },
        { value: 'manufacturing', label: '🏭 Manufacturing' },
        { value: 'hospitality', label: '🏨 Hospitality' },
        { value: 'logistics', label: '🚛 Logistics' },
        { value: 'healthcare', label: '🏥 Healthcare' },
    ];
}
