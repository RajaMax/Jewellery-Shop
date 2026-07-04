import axios from 'axios';

// Requests go to /api which Vite proxies to the backend (see vite.config.js)
const api = axios.create({ baseURL: '/api' });

// Attach the admin token (if logged in) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
