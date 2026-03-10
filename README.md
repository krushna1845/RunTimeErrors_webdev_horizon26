# OpsPulse ⚡
### Real-Time Business Health Monitoring & Crisis Management (SaaS)

OpsPulse is a high-performance business intelligence platform designed for Small and Medium-sized Businesses (SMBs). It unifies fragmented data from sales, inventory, and operations into a single, high-fidelity dashboard. With its intelligent **Business Stress Score**, OpsPulse provides actionable insights, automated crisis alerts, and an AI-powered War Room mode to help owners make data-driven decisions in real-time.

---

## 🚀 Key Features

- **Live Business Stress Score**: A real-time proprietary algorithm that calculates your business health from 0 to 100.
- **Intelligent Alert System**: Automatically detects revenue drops, inventory stockouts, and customer support anomalies.
- **War Room Mode**: A high-intensity UI environment triggered during business crises to focus on immediate recovery actions.
- **AI Chatbot Assistant**: Powered by Google Gemini, providing strategic advice based on your current business metrics.
- **Role-Based Views**: Tailored dashboards for both Business Owners and Operations Managers.
- **Predictive Risk Trends**: Extrapolates current trends to forecast potential risks in the next 7 days.

---

## 🛠️ Project Structure

### Backend (`/backend`)
- `engines/` — Proprietary logic for Stress Scoring, Alerts, and Recommendations.
- `routes/` — API endpoints for metrics, chatbot, and system status.
- `simulators/` — Real-time mock data generator for demonstration.
- `server.js` — Express server with WebSocket integration for real-time updates.

### Frontend (`/frontend`)
- `components/` — Modularized UI library (Gauges, Charts, Alert Panels).
- `hooks/` — Custom hooks for real-time data polling and state management.
- `pages/` — Dedicated dashboards for Owner and Operations roles.
- `context/` — Global state for authentication and feature gating.

---

## 📊 Stress Score Algorithm

The Business Stress Score is calculated using a weighted average of critical KPIs:

```
Stress Score (0–100) =
  0.40 × Sales Decline Index
  0.30 × Inventory Risk Index
  0.20 × Support Complaint Index
  0.10 × Cash Flow Instability
```

### Thresholds:
- **0–30: Healthy 🟢** — Business is operating within optimal parameters.
- **31–59: Caution 🟡** — Minor inefficiencies detected.
- **60–79: Warning 🟠** — Performance is degrading; intervention suggested.
- **80–100: Crisis 🔴** — **War Room Activated**. Immediate action required.

---

## 💎 SaaS Pricing & Tiers

| Feature | Free | Premium ($29/mo) |
|---------|------|-----------------|
| Dashboard views | Owner only | Owner + Ops Manager |
| Data history | 24 hours | 90 days |
| Stress Score | Basic | Full breakdown + trend |
| Alerts | Simple | Crisis + Opportunity + Anomaly |
| War Room Mode | ❌ | ✅ |
| AI Chatbot | ❌ | ✅ |
| Predictive Risk | ❌ | ✅ |

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm / yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/opspulse.git

# Install Backend dependencies
cd backend && npm install

# Install Frontend dependencies
cd ../frontend && npm install
```

### 3. Running Locally
```bash
# Start Backend
cd backend && npm run dev

# Start Frontend (in a new terminal)
cd frontend && npm run dev
```

---

## 🛡️ Verification
The system can be verified by triggering simulator ticks via API:
- `GET /api/stress-score` — View current business health.
- `POST /api/simulate/tick` — Advance data and watch the UI react.
