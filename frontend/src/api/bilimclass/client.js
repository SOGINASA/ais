import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

export const bilimClassClient = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена (если есть)
bilimClassClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ошибок
bilimClassClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('BilimClass API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default bilimClassClient;
