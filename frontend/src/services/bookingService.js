import api from '../api';

export const bookingService = {
    getBooking: (id) => {
        return api.get(`/api/orders/bookings/${id}/`);
    },

    getMyBookings: () => {
        return api.get('/api/orders/my-bookings/');
    },

    updateBooking: (id, data) => {
        return api.put(`/api/orders/bookings/${id}/`, data);
    },

    createBooking: (data) => {
        return api.post('/api/orders/bookings/', data);
    },

    deleteBooking: (id) => {
        return api.delete(`/api/orders/bookings/${id}/`);
    }
};

export default bookingService;