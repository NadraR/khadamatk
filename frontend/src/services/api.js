import axios from 'axios';

// الرابط الأساسي للـAPI
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// إنشاء instance من axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptor لإضافة token التصديق تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
