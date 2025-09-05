export const ACCESS_TOKEN = "access";
export const REFRESH_TOKEN = "refresh";

// ===== API ENDPOINTS =====
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/api/accounts/login/",
        REGISTER: "/api/accounts/register/",
        GOOGLE_LOGIN: "/api/accounts/google-login/",
        REFRESH_TOKEN: "/api/accounts/token/refresh/",
    },
    SERVICES: {
        LIST: "/api/services/",
        DETAIL: (id) => `/api/services/${id}/`,
        ORDERS: "/api/orders/",
        REVIEWS: (serviceId) => `/api/reviews/${serviceId}/`,
        RATINGS: (serviceId) => `/api/ratings/${serviceId}/`,
    },
    INVOICES: {
        LIST: "/api/invoices/",
        DETAIL: (id) => `/api/invoices/${id}/`,
        DOWNLOAD: (id) => `/api/invoices/${id}/download/`,
    },
    BOOKINGS: {
        DETAIL: (id) => `/api/bookings/${id}/`,
    },
};
