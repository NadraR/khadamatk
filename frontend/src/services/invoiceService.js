import api from './api';

export const invoiceService = {

  getMyInvoices: () => {
    return api.get('/invoices/');
  },

  getInvoice: (id) => {
    return api.get(`/invoices/${id}/`);
  },

  markAsPaid: (id) => {
    return api.post(`/invoices/${id}/mark_paid/`);
  },

  downloadInvoice: (id) => {
    return api.get(`/invoices/${id}/download/`, {
      responseType: 'blob'
    });
  }
};

export default invoiceService;
