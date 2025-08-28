// api.js
import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

// interceptor بيضيف التوكن مع كل request
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

// interceptor بيراقب الأخطاء (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // لو التوكن خلص (401) و لسه ماحاولناش نعمل refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = localStorage.getItem(REFRESH_TOKEN);
        const res = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh,
        });

        if (res.status === 200) {
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          api.defaults.headers.Authorization = `Bearer ${res.data.access}`;
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest); // إعادة المحاولة بنفس الـ request
        }
      } catch (err) {
        console.error("Refresh token expired, user must login again.");
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        window.location.href = "/login"; // رجعيه للوجين
      }
    }

    return Promise.reject(error);
  }
);

export default api;
