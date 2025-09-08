
import axios from 'axios';

const ADMIN_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ADMIN_API_URL = `${ADMIN_API_BASE_URL}/api/admin`;

console.log('adminApiService: Environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  ADMIN_API_BASE_URL,
  ADMIN_API_URL
});

const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add admin auth token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle admin auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminApiService = {
  // Authentication
  login: async (username, password) => {
    console.log('adminApiService: Login attempt with:', { username, password: '***' });
    console.log('adminApiService: Base URL:', adminApi.defaults.baseURL);
    console.log('adminApiService: Full URL will be:', `${adminApi.defaults.baseURL}/login/`);
    console.log('adminApiService: Request payload:', { username, password: '***' });
    console.log('adminApiService: Actual username being sent:', username);
    console.log('adminApiService: Actual password being sent:', password);
    try {
      const response = await adminApi.post('/login/', { username, password });
      console.log('adminApiService: Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('adminApiService: Login error:', error);
      console.error('adminApiService: Error response:', error.response?.data);
      console.error('adminApiService: Request config:', error.config);
      console.error('adminApiService: Request data:', error.config?.data);
      throw error;
    }
  },

  getMe: async () => {
    const response = await adminApi.get('/me/');
    return response.data;
  },

  // Stats
  getStats: async () => {
    const response = await adminApi.get('/stats/');
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await adminApi.get('/users/');
    return response.data;
  },

  activateUser: async (userId) => {
    await adminApi.post(`/users/${userId}/activate/`);
  },

  deactivateUser: async (userId) => {
    await adminApi.post(`/users/${userId}/deactivate/`);
  },

  setUserStaff: async (userId, isStaff) => {
    await adminApi.post(`/users/${userId}/set_staff/`, { is_staff: isStaff });
  },

  // Services
  getServices: async () => {
    const response = await adminApi.get('/services/');
    return response.data;
  },

  toggleServiceActive: async (serviceId) => {
    const response = await adminApi.post(`/services/${serviceId}/toggle_active/`);
    return response.data;
  },

  // Orders
  getOrders: async () => {
    const response = await adminApi.get('/orders/');
    return response.data;
  },

  setOrderStatus: async (orderId, status) => {
    const response = await adminApi.post(`/orders/${orderId}/set_status/`, { status });
    return response.data;
  },

  assignProvider: async (orderId, providerId) => {
    const response = await adminApi.post(`/orders/${orderId}/assign_provider/`, { provider_id: providerId });
    return response.data;
  },

  // Reviews
  getReviews: async () => {
    const response = await adminApi.get('/reviews/');
    return response.data;
  },

  softDeleteReview: async (reviewId) => {
    const response = await adminApi.post(`/reviews/${reviewId}/soft_delete/`);
    return response.data;
  },

  // Ratings
  getRatings: async () => {
    const response = await adminApi.get('/ratings/');
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await adminApi.get('/notifications/');
    return response.data;
  },

  getUnreadNotifications: async () => {
    const response = await adminApi.get('/notifications/unread/');
    return response.data;
  },

  // Settings (Platform Settings)
  getSettings: async () => {
    const response = await adminApi.get('/platformsettings/');
    return response.data;
  },

  updateSetting: async (settingId, value) => {
    const response = await adminApi.patch(`/platformsettings/${settingId}/`, { value });
    return response.data;
  },

  // Logs
  getAdminLogs: async () => {
    const response = await adminApi.get('/adminactionlogs/');
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await adminApi.get('/categories/');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await adminApi.post('/categories/', categoryData);
    return response.data;
  },

  updateCategory: async (categoryId, categoryData) => {
    const response = await adminApi.patch(`/categories/${categoryId}/`, categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    await adminApi.delete(`/categories/${categoryId}/`);
  },

  // Me (admin profile & permissions)
  getAdminMe: async () => {
    const response = await adminApi.get('/me/');
    return response.data;
  },

  // Financial Report
  getInvoices: async () => {
    const response = await adminApi.get('/invoices/');
    return response.data;
  },

  markInvoicePaid: async (invoiceId) => {
    const response = await adminApi.post(`/invoices/${invoiceId}/mark_paid/`);
    return response.data;
  },

  exportInvoicesCSV: async () => {
    const response = await adminApi.get('/invoices/export_csv/', { responseType: 'blob' });
    return response.data;
  },

  // Financial Report
  getFinancialReport: async () => {
    const response = await adminApi.get('/financial-report/');
    return response.data;
  }
};

export default adminApi;
