import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";
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
//     if (
//       error.response &&
//       error.response.status === 401 &&
//       !originalRequest._retry
//     ) {
//       originalRequest._retry = true;
//       const refresh = localStorage.getItem(REFRESH_TOKEN);

//       if (refresh) {
//         try {
//           const res = await axios.post(`${BASE_URL}/auth/jwt/refresh/`, {
//             refresh: refresh,
//           });
//           const newAccess = res.data.access;

//           localStorage.setItem(ACCESS_TOKEN, newAccess);
//           api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
//           originalRequest.headers.Authorization = `Bearer ${newAccess}`;

//           return api(originalRequest); // يعيد تنفيذ الطلب اللي فشل
//         } catch (err) {
//           // refresh token بايظ → خروج المستخدم
//           localStorage.removeItem(ACCESS_TOKEN);
//           localStorage.removeItem(REFRESH_TOKEN);
//           window.location.href = "/";
//         }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
