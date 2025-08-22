import api from "./client";

export const listOrders = () => api.get("/orders/");
export const createOrder = (payload) => api.post("/orders/", payload);
export const getOrder = (id) => api.get(`/orders/${id}/`);
export const updateOrder = (id, payload) => api.put(`/orders/${id}/`, payload);
export const deleteOrder = (id) => api.delete(`/orders/${id}/`);

export const createOffer = (orderId, payload) =>
  api.post(`/orders/${orderId}/offers/`, payload);

export const createNegotiation = (orderId, payload) =>
  api.post(`/orders/${orderId}/negotiations/`, payload);
