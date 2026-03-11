import axios from 'axios';


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';


const api = axios.create({
  baseURL: API_BASE,
});

// Auth
export async function login(email, password, role) {
  return (await api.post('/auth/login', { email, password, role })).data;
}

export async function register(data) {
  return (await api.post('/auth/register', data)).data;
}

// Simulation
export async function advanceTick() {
  return (await api.post('/simulate/tick')).data;
}

export async function setSevereCrisis(active) {
  return (await api.post('/simulate/crisis', { active })).data;
}

export async function getSalesMetrics() {
  const res = await api.get('/metrics');
  return res.data.sales;
}

export async function getInventoryMetrics() {
  const res = await api.get('/metrics');
  return res.data.inventory;
}

export async function getSupportMetrics() {
  const res = await api.get('/metrics');
  return res.data.support;
}

export async function getCashflowMetrics() {
  const res = await api.get('/metrics');
  return res.data.cashflow;
}

export async function getStressScore(businessType = 'generic') {
  const params = businessType !== 'generic' ? `?businessType=${businessType}` : '';
  return (await api.get(`/stress-score${params}`)).data;
}

export async function getAlerts() {
  return (await api.get('/alerts')).data;
}

export async function getRecommendations() {
  return (await api.get('/recommendations')).data;
}

export async function getPredictions() {
  return (await api.get('/predictions')).data;
}

export async function sendChatMessage(message) {
  return (await api.post('/chatbot', { message })).data;
}

export async function getReportSummary() {
  return (await api.get('/reports/summary')).data;
}

export async function uploadExternalData(metrics) {
  return (await api.post('/data-source/upload', { metrics })).data;
}

export async function setRemoteDataSource(url) {
  return (await api.post('/data-source/external', { url })).data;
}

export async function getAllMetrics() {
  return (await api.get('/metrics')).data;
}

export async function getHistory(range = '24h') {
  return (await api.get(`/history?range=${range}`)).data;
}
