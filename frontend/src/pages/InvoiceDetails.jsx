import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FaFileInvoiceDollar, 
  FaCalendarAlt, 
  FaCreditCard,
  FaMoneyBillWave,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaDownload,
  FaPrint,
  FaArrowRight,
  FaInfoCircle,
  FaReceipt
} from 'react-icons/fa';
import invoiceService from '../services/InvoiceService';
import Navbar from '../components/Navbar';
import './InvoiceDetails.css';

const InvoiceDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const loadInvoiceData = async () => {
      if (id) {
        try {
          setLoading(true);
          const result = await invoiceService.getInvoice(id);
          if (result.success) {
            setInvoice(result.data);
            setError('');
          } else {
            setError(result.error);
          }
        } catch (error) {
          console.error('Error loading invoice:', error);
          setError('حدث خطأ في تحميل الفاتورة');
        } finally {
          setLoading(false);
        }
      }
    };

    loadInvoiceData();
  }, [id]);

  const loadInvoice = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const result = await invoiceService.getInvoice(id);
      if (result.success) {
        setInvoice(result.data);
        setError('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError('حدث خطأ في تحميل الفاتورة');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { class: 'badge-success', icon: FaCheck, text: 'مدفوعة' },
      unpaid: { class: 'badge-danger', icon: FaExclamationTriangle, text: 'غير مدفوعة' },
      pending: { class: 'badge-warning', icon: FaClock, text: 'قيد الانتظار' },
      overdue: { class: 'badge-danger', icon: FaExclamationTriangle, text: 'متأخرة' }
    };
    
    const config = statusConfig[status] || statusConfig.unpaid;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class}`}>
        <Icon className="me-1" />
        {config.text}
      </span>
    );
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      cash: 'نقداً',
      card: 'بطاقة ائتمان',
      wallet: 'محفظة إلكترونية',
      bank: 'تحويل بنكي'
    };
    return methods[method] || 'غير محدد';
  };

  const handlePayment = async (paymentMethod) => {
    try {
      setPaymentLoading(true);
      const result = await invoiceService.markAsPaid(id, paymentMethod);
      if (result.success) {
        loadInvoice(); // إعادة تحميل الفاتورة
        setError('');
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('حدث خطأ في معالجة الدفع');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const result = await invoiceService.downloadInvoice(id);
      if (!result.success) {
        setError(result.error);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setError('حدث خطأ في تحميل الفاتورة');
    }
  };

  if (loading) {
    return (
      <div className="invoice-details" dir="rtl">
        <Navbar />
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-details" dir="rtl">
        <Navbar />
        <div className="container mt-5">
          <div className="error-container">
            <div className="alert alert-danger">
              <FaExclamationTriangle className="me-2" />
              {error || 'الفاتورة غير موجودة'}
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/home-client')}
            >
              <FaArrowRight className="me-2" />
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-details" dir="rtl">
      <Navbar />
      
      <div className="container mt-4">
        {/* Header */}
        <div className="invoice-header mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <button 
                className="btn btn-outline-secondary btn-sm mb-3"
                onClick={() => navigate('/home-client')}
              >
                <FaArrowRight className="me-2" />
                العودة للصفحة الرئيسية
              </button>
              <h2 className="fw-bold text-primary mb-2">
                <FaFileInvoiceDollar className="me-2" />
                تفاصيل الفاتورة #{invoice.id}
              </h2>
              <p className="text-muted mb-0">
                {invoice.order_title}
              </p>
            </div>
            <div className="col-md-4 text-end">
              <div className="invoice-actions">
                <button 
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={handleDownload}
                >
                  <FaDownload className="me-1" />
                  تحميل
                </button>
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => window.print()}
                >
                  <FaPrint className="me-1" />
                  طباعة
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Invoice Details Card */}
          <div className="col-lg-8">
            <div className="invoice-card">
              <div className="invoice-card-header">
                <h5>
                  <FaReceipt className="me-2" />
                  تفاصيل الفاتورة
                </h5>
                {getStatusBadge(invoice.status)}
              </div>
              
              <div className="invoice-card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="invoice-detail">
                      <label>رقم الحجز:</label>
                      <span>#{invoice.booking_id}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="invoice-detail">
                      <label>المبلغ المطلوب:</label>
                      <span className="amount">{invoice.amount} ج.م</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="invoice-detail">
                      <label>تاريخ الإصدار:</label>
                      <span>
                        <FaCalendarAlt className="me-1" />
                        {new Date(invoice.issued_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="invoice-detail">
                      <label>تاريخ الاستحقاق:</label>
                      <span>
                        <FaCalendarAlt className="me-1" />
                        {invoice.due_date ? 
                          new Date(invoice.due_date).toLocaleDateString('ar-EG') : 
                          'غير محدد'
                        }
                      </span>
                    </div>
                  </div>
                  {invoice.paid_at && (
                    <div className="col-md-6">
                      <div className="invoice-detail">
                        <label>تاريخ الدفع:</label>
                        <span className="text-success">
                          <FaCheck className="me-1" />
                          {new Date(invoice.paid_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  )}
                  {invoice.payment_method && (
                    <div className="col-md-6">
                      <div className="invoice-detail">
                        <label>طريقة الدفع:</label>
                        <span>
                          <FaCreditCard className="me-1" />
                          {getPaymentMethodText(invoice.payment_method)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="col-12">
                    <div className="invoice-detail">
                      <label>اسم الخدمة:</label>
                      <span>{invoice.service_name}</span>
                    </div>
                  </div>
                  {invoice.notes && (
                    <div className="col-12">
                      <div className="invoice-detail">
                        <label>ملاحظات:</label>
                        <span>{invoice.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Actions */}
          <div className="col-lg-4">
            <div className="payment-card">
              <div className="payment-card-header">
                <h5>
                  <FaMoneyBillWave className="me-2" />
                  إجراءات الدفع
                </h5>
              </div>
              
              <div className="payment-card-body">
                {invoice.status === 'paid' ? (
                  <div className="payment-success">
                    <div className="success-icon">
                      <FaCheck />
                    </div>
                    <h6>تم الدفع بنجاح</h6>
                    <p className="text-muted">
                      تم دفع هذه الفاتورة في {new Date(invoice.paid_at).toLocaleDateString('ar-EG')}
                    </p>
                    {invoice.payment_method && (
                      <div className="payment-method-used">
                        <small>
                          <FaCreditCard className="me-1" />
                          {getPaymentMethodText(invoice.payment_method)}
                        </small>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="payment-options">
                    <div className="amount-to-pay">
                      <h4 className="text-primary">{invoice.amount} ج.م</h4>
                      <p className="text-muted">المبلغ المطلوب دفعه</p>
                    </div>
                    
                    {invoice.is_overdue && (
                      <div className="alert alert-warning">
                        <FaExclamationTriangle className="me-2" />
                        هذه الفاتورة متأخرة عن موعد الاستحقاق
                      </div>
                    )}
                    
                    <div className="payment-methods">
                      <h6>اختر طريقة الدفع:</h6>
                      <div className="payment-buttons">
                        <button 
                          className="btn btn-payment"
                          onClick={() => handlePayment('cash')}
                          disabled={paymentLoading}
                        >
                          <FaMoneyBillWave className="me-2" />
                          نقداً
                        </button>
                        <button 
                          className="btn btn-payment"
                          onClick={() => handlePayment('card')}
                          disabled={paymentLoading}
                        >
                          <FaCreditCard className="me-2" />
                          بطاقة ائتمان
                        </button>
                        <button 
                          className="btn btn-payment"
                          onClick={() => handlePayment('wallet')}
                          disabled={paymentLoading}
                        >
                          <FaReceipt className="me-2" />
                          محفظة إلكترونية
                        </button>
                        <button 
                          className="btn btn-payment"
                          onClick={() => handlePayment('bank')}
                          disabled={paymentLoading}
                        >
                          <FaInfoCircle className="me-2" />
                          تحويل بنكي
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="invoice-summary">
              <h6>ملخص الفاتورة</h6>
              <div className="summary-row">
                <span>المبلغ الأساسي:</span>
                <span>{invoice.amount} ج.م</span>
              </div>
              <div className="summary-row">
                <span>الضرائب:</span>
                <span>0.00 ج.م</span>
              </div>
              <div className="summary-row total">
                <span>المجموع:</span>
                <span>{invoice.amount} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails; 