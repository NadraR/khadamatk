import api from '../api';

export const invoiceService = {
  getMyInvoices: () => {
    return api.get('/api/invoices/my_invoices/');
  },

  getInvoice: (id) => {
    return api.get(`/api/invoices/${id}/`);
  },

  markAsPaid: (id) => {
    return api.post(`/api/invoices/${id}/mark_as_paid/`);
  },

  downloadInvoice: (id) => {
    return api.get(`/api/invoices/${id}/download/`, {
      responseType: 'blob'
    });
  },

  getReports: () => {
    return api.get('/api/invoices/reports/');
  },

  createPayment: (invoiceId) => {
    return api.post(`/api/invoices/create-payment/${invoiceId}/`);
  },

  getInvoiceForBooking: (bookingId) => {
    return api.get(`/api/invoices/by-booking/${bookingId}/`);
  }
};

export default invoiceService;