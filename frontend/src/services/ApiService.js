import axios from "axios";

class ApiService {
  constructor(baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/") {
    this.baseURL = baseURL;
    this.retryCount = 0;
    this.maxRetries = 1;

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    // ⬅️ Interceptor لإضافة الـ access token
    this.api.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem("access");
        console.log("[DEBUG][Request] →", config.url);
        console.log("[DEBUG][Request] Access token:", accessToken);

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ⬅️ Interceptor لتجديد التوكن عند 401
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

          console.log("[DEBUG] 401 detected → Trying refresh...");
          const newTokens = await this.refreshToken(localStorage.getItem("refresh"));

          if (newTokens?.access) {
            localStorage.setItem("access", newTokens.access);
            if (newTokens.refresh) localStorage.setItem("refresh", newTokens.refresh);

            console.log("[DEBUG] Token refreshed, retrying request:", originalRequest.url);
            return this.api(originalRequest);
          } else {
            console.warn("[DEBUG] Refresh token failed → clearing auth");
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
      console.log("[DEBUG] Calling refresh endpoint with token:", refreshToken);
      const response = await axios.post(`${this.baseURL}/api/accounts/token/refresh/`, {
        refresh: refreshToken,
      });
      console.log("[DEBUG] Refresh response:", response.data);
      return response.data;
    } catch (err) {
      this.clearAuth();
      console.error("[DEBUG] Error refreshing token:", err.response?.data || err.message);
      return null;
    }
  }

  clearAuth() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    this.retryCount = 0;
  }

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
