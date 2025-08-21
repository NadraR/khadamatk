import api from './api';

export const invoiceService = {
  // الحصول على جميع فواتير المستخدم
  getMyInvoices: () => {
    return api.get('/invoices/my_invoices/');
  },

  // الحصول على فاتورة محددة
  getInvoice: (id) => {
    return api.get(`/invoices/${id}/`);
  },

  // وضع فاتورة كمُدفوعة (للمشرفين فقط)
  markAsPaid: (id) => {
    return api.post(`/invoices/${id}/mark_paid/`);
  },

  // تنزيل الفاتورة كـPDF
  downloadInvoice: (id) => {
    return api.get(`/invoices/${id}/download/`, {
      responseType: 'blob' // مهم لتحميل الملفات
    });
  }
};

export default invoiceService;
