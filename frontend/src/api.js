// src/api.js
import axios from "axios";

export const ACCESS_TOKEN = "access_token";
export const REFRESH_TOKEN = "refresh_token";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ✅ request interceptor: يضيف التوكن في كل طلب
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ response interceptor: لو التوكن خلص (401) يعمل refresh تلقائي
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem(REFRESH_TOKEN);

      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/jwt/refresh/`, {
            refresh: refresh,
          });
          const newAccess = res.data.access;

          localStorage.setItem(ACCESS_TOKEN, newAccess);
          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;

          return api(originalRequest); // يعيد تنفيذ الطلب اللي فشل
        } catch (err) {
          // refresh token بايظ → خروج المستخدم
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem(REFRESH_TOKEN);
          window.location.href = "/";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
