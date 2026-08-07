import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API, withCredentials: true });

export const submitLead = (payload) => api.post('/leads', payload).then(r => r.data);
export const subscribeNewsletter = (email, source = 'footer') => api.post('/newsletter', { email, source }).then(r => r.data);
export const sendChat = (session_id, message) => api.post('/chat', { session_id, message }).then(r => r.data);
export const captureChatLead = (payload) => api.post('/chat/lead', payload).then(r => r.data);

// Auth
export const exchangeSession = (session_id) => api.post('/auth/session', {}, { headers: { 'X-Session-ID': session_id } }).then(r => r.data);
export const me = () => api.get('/auth/me').then(r => r.data);
export const logout = () => api.post('/auth/logout').then(r => r.data);

// Admin
export const adminLeads = (type) => api.get('/admin/leads', { params: type ? { type } : {} }).then(r => r.data);
export const adminStats = () => api.get('/admin/stats').then(r => r.data);
export const adminNewsletter = () => api.get('/admin/newsletter').then(r => r.data);
