import api from "./client";

export const listOrders = () => api.get("/api/orders/");
export const createOrder = (payload) => api.post("/api/orders/", payload);
export const getOrder = (id) => api.get(`/api/orders/${id}/`);
export const updateOrder = (id, payload) => api.put(`/api/orders/${id}/`, payload);
export const deleteOrder = (id) => api.delete(`/api/orders/${id}/`);

export const createOffer = (orderId, payload) =>
  api.post(`/api/orders/${orderId}/offers/`, payload);

export const createNegotiation = (orderId, payload) =>
  api.post(`/api/orders/${orderId}/negotiations/`, payload);
