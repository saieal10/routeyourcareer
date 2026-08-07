import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const submitLead = (payload) => api.post('/leads', payload).then(r => r.data);
export const subscribeNewsletter = (email, source = 'footer') => api.post('/newsletter', { email, source }).then(r => r.data);
export const sendChat = (session_id, message) => api.post('/chat', { session_id, message }).then(r => r.data);
export const captureChatLead = (payload) => api.post('/chat/lead', payload).then(r => r.data);
