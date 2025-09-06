import apiService from './ApiService';

class InvoiceService {
  constructor() {
    this.baseEndpoint = '/api/invoices';
  }

  /**
   * جلب جميع الفواتير للمستخدم الحالي
   */
  async getMyInvoices() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/my_invoices/`);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'حدث خطأ في جلب الفواتير'
      };
    }
  }

  /**
   * جلب تفاصيل فاتورة محددة
   */
  async getInvoice(invoiceId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/${invoiceId}/`);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'حدث خطأ في جلب الفاتورة'
      };
    }
  }

  /**
   * جلب فاتورة باستخدام رقم الطلب
   */
  async getInvoiceByOrderId(orderId) {
    try {
      // Get all user invoices and find the one for this order
      const invoicesResponse = await this.getMyInvoices();
      if (invoicesResponse.success) {
        const invoice = invoicesResponse.data.find(inv => inv.order_id === parseInt(orderId));
        if (invoice) {
          return {
            success: true,
            data: invoice,
            error: null
          };
        } else {
          return {
            success: false,
            data: null,
            error: 'لم يتم العثور على فاتورة لهذا الطلب'
          };
        }
      } else {
        return invoicesResponse;
      }
    } catch (error) {
      console.error('Error fetching invoice by order ID:', error);
      return {
        success: false,
        data: null,
        error: 'حدث خطأ في جلب الفاتورة'
      };
    }
  }

  /**
   * تحديد فاتورة كمدفوعة
   */
  async markAsPaid(invoiceId, paymentMethod) {
    try {
      const response = await apiService.post(`${this.baseEndpoint}/${invoiceId}/mark_paid/`, {
        payment_method: paymentMethod
      });
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'حدث خطأ في معالجة الدفع'
      };
    }
  }

  /**
   * جلب إحصائيات الفواتير
   */
  async getInvoiceStats() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/stats/`);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      return {
        success: false,
        data: {
          total_invoices: 0,
          paid_invoices: 0,
          unpaid_invoices: 0,
          overdue_invoices: 0,
          total_amount: 0,
          paid_amount: 0
        },
        error: error.response?.data?.message || 'حدث خطأ في جلب الإحصائيات'
      };
    }
  }

  /**
   * تحميل فاتورة كـ PDF
   */
  async downloadInvoice(invoiceId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/${invoiceId}/download/`, {
        responseType: 'blob'
      });
      
      // إنشاء رابط تحميل
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        data: 'تم تحميل الفاتورة بنجاح',
        error: null
      };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'حدث خطأ في تحميل الفاتورة'
      };
    }
  }

  /**
   * البحث في الفواتير
   */
  async searchInvoices(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        search: query,
        ...filters
      });
      
      const response = await apiService.get(`${this.baseEndpoint}/search/?${params}`);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error searching invoices:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'حدث خطأ في البحث'
      };
    }
  }

  /**
   * تصدير الفواتير
   */
  async exportInvoices(format = 'excel', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await apiService.get(`${this.baseEndpoint}/export/?${params}`, {
        responseType: 'blob'
      });
      
      // تحديد اسم الملف بناءً على التنسيق
      const fileName = `invoices.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      
      // إنشاء رابط تحميل
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        data: 'تم تصدير الفواتير بنجاح',
        error: null
      };
    } catch (error) {
      console.error('Error exporting invoices:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'حدث خطأ في تصدير الفواتير'
      };
    }
  }

  /**
   * تحديث ملاحظات الفاتورة
   */
  async updateInvoiceNotes(invoiceId, notes) {
    try {
      const response = await apiService.patch(`${this.baseEndpoint}/${invoiceId}/`, {
        notes
      });
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error updating invoice notes:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'حدث خطأ في تحديث الملاحظات'
      };
    }
  }

  /**
   * جلب الفواتير المتأخرة
   */
  async getOverdueInvoices() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/overdue/`);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      return {
        success: false,
        data: [],
        error: error.response?.data?.message || 'حدث خطأ في جلب الفواتير المتأخرة'
      };
    }
  }

  /**
   * إرسال تذكير بالدفع
   */
  async sendPaymentReminder(invoiceId) {
    try {
      const response = await apiService.post(`${this.baseEndpoint}/${invoiceId}/send_reminder/`);
      return {
        success: true,
        data: response,
        error: null
      };
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'حدث خطأ في إرسال التذكير'
      };
    }
  }
}

export default new InvoiceService();


