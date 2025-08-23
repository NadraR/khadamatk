import api from "./client";

export const listServiceReviews = (serviceId) =>
  api.get(`/reviews/service/${serviceId}/`);

export const createReview = (serviceId, payload) =>
  api.post(`/reviews/service/${serviceId}/`, payload);

export const getReview = (id) => api.get(`/reviews/${id}/`);
export const updateReview = (id, payload) => api.put(`/reviews/${id}/`, payload);
export const deleteReview = (id) => api.delete(`/reviews/${id}/`);
