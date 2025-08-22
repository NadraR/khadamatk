import api from "./client";

export const listServiceRatings = (serviceId) =>
  api.get(`/ratings/service/${serviceId}/`);

export const rateOrder = (orderId, payload) =>
  api.post(`/ratings/order/${orderId}/`, payload);
