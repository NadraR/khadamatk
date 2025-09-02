import axios from "axios";

class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/") {
    this.baseURL = baseURL;
    this.retryCount = 0;
    this.maxRetries = 1;

    // إنشاء instance من axios
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000, // 10 ثواني
    });

    // interceptor لإضافة token تلقائياً
    this.api.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("access");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // interceptor للتعامل مع الأخطاء و retry لتجديد التوكن
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          localStorage.getItem("refresh") &&
          !originalRequest._retry &&
          this.retryCount < this.maxRetries
        ) {
          this.retryCount++;
          originalRequest._retry = true;

          const newTokens = await this.refreshToken(localStorage.getItem("refresh"));
          if (newTokens?.access) {
            localStorage.setItem("access", newTokens.access);
            if (newTokens.refresh) localStorage.setItem("refresh", newTokens.refresh);

            // إعادة المحاولة بعد تحديث التوكن
            return this.api(originalRequest);
          } else {
            this.clearAuth();
          }
        }

        this.retryCount = 0;
        return Promise.reject(error);
      }
    );
  }

  async refreshToken(refreshToken) {
    try {
      // Fixed: use the correct endpoint with /api/ prefix
      const response = await axios.post(`${this.baseURL}/auth/jwt/refresh/`, {
        refresh: refreshToken,
      });
      return response.data;
    } catch (err) {
      this.clearAuth();
      console.error("Error refreshing token:", err);
      return null;
    }
  }

  clearAuth() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    this.retryCount = 0;
  }

  // دوال مساعدة للطلبات
  async get(endpoint, headers = {}) {
    return this.api.get(endpoint, { headers }).then((res) => res.data);
  }

  async post(endpoint, body, headers = {}) {
    return this.api.post(endpoint, body, { headers }).then((res) => res.data);
  }

  async put(endpoint, body, headers = {}) {
    return this.api.put(endpoint, body, { headers }).then((res) => res.data);
  }

  async patch(endpoint, body, headers = {}) {
    return this.api.patch(endpoint, body, { headers }).then((res) => res.data);
  }

  async delete(endpoint, headers = {}) {
    return this.api.delete(endpoint, { headers }).then((res) => res.data);
  }
}

export default new ApiService();