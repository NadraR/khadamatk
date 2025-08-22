import api from "./client";

// ---- Categories
export const listCategories = () => api.get("/services/categories/");

// ---- Services
export const listServices = (params = {}) => api.get("/services/", { params });
export const getService = (id) => api.get(`/services/${id}/`);
export const createService = (payload) => api.post("/services/", payload);
export const updateService = (id, payload) => api.put(`/services/${id}/`, payload);
export const deleteService = (id) => api.delete(`/services/${id}/`);


// ---- Favorites
export const listFavorites = () => api.get("/services/favorites/");
export const addFavorite = (serviceId) => api.post("/services/favorites/add/", { service_id: serviceId });
export const removeFavorite = (serviceId) => api.delete(`/services/favorites/${serviceId}/`);

// ---- Search
export const searchServices = (params = {}) => api.get("/services/search/", { params });
export const getProviderDetail = (providerId) => api.get(`/services/providers/${providerId}/`);
