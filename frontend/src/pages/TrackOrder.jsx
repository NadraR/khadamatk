import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ApiService } from "../services/ApiService";
import { authService } from "../services/authService";
import { 
  BsCheckCircle, 
  BsXCircle, 
  BsEye, 
  BsClock, 
  BsGeoAlt, 
  BsCurrencyDollar,
  BsPersonFill,
  BsFilter,
  BsArrowLeft,
  BsArrowRight,
  BsPhone,
  BsCheckLg,
  BsHourglassSplit,
  BsArrowClockwise,
  BsHouse
} from "react-icons/bs";
import { FaMapMarkerAlt, FaPhone, FaUser, FaComments, FaTools, FaFileInvoiceDollar } from "react-icons/fa";
import { toast } from 'react-toastify';
import InvoiceService from '../services/InvoiceService';
import "./TrackOrder.css";

// Translation object
const translations = {
  ar: {
    trackMyOrders: "تتبع طلباتي",
    allOrders: "جميع الطلبات",
    pending: "في الانتظار",
    accepted: "مقبولة",
    declined: "مرفوضة",
    inProgress: "قيد التنفيذ",
    completed: "مكتملة",
    refresh: "تحديث",
    noOrders: "لا توجد طلبات",
    noOrdersWithStatus: "لا توجد طلبات",
    orderNumber: "رقم الطلب",
    description: "الوصف",
    category: "التصنيف",
    workerInfo: "معلومات العامل",
    name: "الاسم",
    phone: "الهاتف",
    call: "اتصال",
    locationDetails: "تفاصيل الموقع",
    address: "العنوان",
    viewOnMap: "عرض على الخريطة",
    priceDetails: "تفاصيل السعر",
    offeredPrice: "السعر المعروض",
    servicePrice: "سعر الخدمة الأساسي",
    timeline: "الجدول الزمني",
    orderDate: "تاريخ الطلب",
    scheduledTime: "موعد التنفيذ المطلوب",
    deliveryTime: "موعد التسليم المطلوب",
    declineReason: "سبب الرفض",
    viewFullDetails: "عرض التفاصيل الكاملة",
    contactWorker: "تواصل مع العامل",
    confirmCompletion: "تأكيد الاكتمال",
    viewInvoice: "عرض الفاتورة",
    reorder: "إعادة الطلب",
    cancelOrder: "إلغاء الطلب",
    orderDetails: "تفاصيل الطلب",
    orderStatus: "حالة الطلب",
    serviceInfo: "معلومات الخدمة",
    serviceName: "اسم الخدمة",
    serviceDescription: "وصف الخدمة",
    problemDescription: "وصف المشكلة/الطلب",
    workerName: "الاسم",
    workerEmail: "البريد الإلكتروني",
    workerPhone: "رقم الهاتف",
    directCall: "اتصال مباشر",
    priceOffered: "السعر المعروض",
    close: "إغلاق",
    loading: "جاري التحميل...",
    loadingOrders: "جاري تحميل طلباتك...",
    showFrom: "عرض",
    of: "من أصل",
    orders: "طلب",
    errorLoadingOrders: "خطأ في تحميل الطلبات",
    clientOnlyPage: "هذه الصفحة مخصصة للعملاء فقط",
    orderCancelled: "تم إلغاء الطلب بنجاح",
    errorCancelling: "خطأ في إلغاء الطلب",
    orderCompleted: "تم تأكيد اكتمال الطلب بنجاح! تم إنشاء الفاتورة .",
    errorCompleting: "خطأ في تأكيد اكتمال الطلب",
    invoiceNotFound: "لم يتم العثور على فاتورة لهذا الطلب",
    errorAccessingInvoice: "خطأ في الوصول للفاتورة",
    reorderError: "حدث خطأ أثناء إعداد إعادة الطلب",
    confirmCancel: "هل أنت متأكد من إلغاء هذا الطلب؟",
    confirmComplete: "هل أنت متأكد من تأكيد اكتمال هذا الطلب؟ سيتم إنشاء فاتورة تلقائياً.",
    noWorkerAssigned: "لم يتم تعيين عامل لهذا الطلب بعد",
    language: "اللغة",
    filterBy: "فلترة حسب",
    trackOrdersSubtitle: "تتبع جميع طلباتك وحالتها من مكان واحد",
    backToHome: "العودة للملف الشخصي"
  },
  en: {
    trackMyOrders: "Track My Orders",
    allOrders: "All Orders",
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined",
    inProgress: "In Progress",
    completed: "Completed",
    refresh: "Refresh",
    noOrders: "No orders found",
    noOrdersWithStatus: "No orders found",
    orderNumber: "Order #",
    description: "Description",
    category: "Category",
    workerInfo: "Worker Information",
    name: "Name",
    phone: "Phone",
    call: "Call",
    locationDetails: "Location Details",
    address: "Address",
    viewOnMap: "View on Map",
    priceDetails: "Price Details",
    offeredPrice: "Offered Price",
    servicePrice: "Base Service Price",
    timeline: "Timeline",
    orderDate: "Order Date",
    scheduledTime: "Scheduled Time",
    deliveryTime: "Delivery Time",
    declineReason: "Decline Reason",
    viewFullDetails: "View Full Details",
    contactWorker: "Contact Worker",
    confirmCompletion: "Confirm Completion",
    viewInvoice: "View Invoice",
    reorder: "Reorder",
    cancelOrder: "Cancel Order",
    orderDetails: "Order Details",
    orderStatus: "Order Status",
    serviceInfo: "Service Information",
    serviceName: "Service Name",
    serviceDescription: "Service Description",
    problemDescription: "Problem/Order Description",
    workerName: "Name",
    workerEmail: "Email",
    workerPhone: "Phone",
    directCall: "Direct Call",
    priceOffered: "Offered Price",
    close: "Close",
    loading: "Loading...",
    loadingOrders: "Loading your orders...",
    showFrom: "Showing",
    of: "of",
    orders: "orders",
    errorLoadingOrders: "Error loading orders",
    clientOnlyPage: "This page is for clients only",
    orderCancelled: "Order cancelled successfully",
    errorCancelling: "Error cancelling order",
    orderCompleted: "Order completion confirmed successfully! Invoice created.",
    errorCompleting: "Error confirming order completion",
    invoiceNotFound: "No invoice found for this order",
    errorAccessingInvoice: "Error accessing invoice",
    reorderError: "Error preparing reorder data",
    confirmCancel: "Are you sure you want to cancel this order?",
    confirmComplete: "Are you sure you want to confirm completion of this order? An invoice will be created automatically.",
    noWorkerAssigned: "No worker has been assigned to this order yet",
    language: "Language",
    filterBy: "Filter by",
    trackOrdersSubtitle: "Track all your orders and their status from one place",
    backToHome: "Back to Home"
  }
};

// Create ApiService instance outside component to avoid recreation
const apiService = new ApiService();

const TrackOrder = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [language, setLanguage] = useState('ar');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  // Translation function
  const t = useCallback((key) => {
    return translations[language][key] || key;
  }, [language]);

  // Load language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'ar';
    setLanguage(savedLanguage);
  }, []);

  const fetchClientOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        page_size: 10
        // No worker_only parameter - this gets client's own orders
      });

      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await apiService.get(`/api/orders/?${params}`);
      
      if (response) {
        const ordersData = response.results || response.data || response;
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        
        // Update pagination if response has pagination info
        if (response.count !== undefined) {
          setPagination(prev => ({
            ...prev,
            totalCount: response.count,
            totalPages: Math.ceil(response.count / 10)
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching client orders:", err);
      toast.error(t('errorLoadingOrders'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, pagination.page, t]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === 'client') {
      fetchClientOrders();
    } else {
      toast.error(t('clientOnlyPage'));
      navigate('/');
    }
  }, [fetchClientOrders, navigate, t]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'declined': return 'danger';
      case 'in_progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return t('pending');
      case 'accepted': return t('accepted');
      case 'declined': return t('declined');
      case 'in_progress': return t('inProgress');
      case 'completed': return t('completed');
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <BsHourglassSplit className="me-1" />;
      case 'accepted': return <BsCheckCircle className="me-1" />;
      case 'declined': return <BsXCircle className="me-1" />;
      case 'in_progress': return <FaTools className="me-1" />;
      case 'completed': return <BsCheckLg className="me-1" />;
      case 'cancelled': return <BsXCircle className="me-1" />;
      default: return <BsClock className="me-1" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'غير محدد';
    return `${price} ج.م`;
  };

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };

  const handleContactWorker = (order) => {
    if (order.worker_name || order.worker) {
      // Navigate to messages page with specific order ID
      navigate('/messages', { 
        state: { 
          orderId: order.id,
          workerName: order.worker_name || order.worker?.username || 'عامل غير محدد',
          serviceName: order.service?.title || order.service_name || 'خدمة غير محددة'
        } 
      });
    } else {
      toast.info("لم يتم تعيين عامل لهذا الطلب بعد");
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm(t('confirmCancel'))) {
      return;
    }

    try {
      await apiService.delete(`/api/orders/${orderId}/`);
      toast.success(t('orderCancelled'));
      fetchClientOrders(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(t('errorCancelling'));
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm(t('confirmComplete'))) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [orderId]: 'completing' }));
    
    try {
      const response = await apiService.post(`/api/orders/${orderId}/complete/`, {});
      
      if (response) {
        toast.success(t('orderCompleted'));
        fetchClientOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(
        error.response?.data?.error || t('errorCompleting')
      );
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleViewInvoice = async (orderId) => {
    try {
      const result = await InvoiceService.getInvoiceByOrderId(orderId);
      if (result.success) {
        // Navigate to invoice details page with the actual invoice ID
        navigate(`/invoice-details/${result.data.id}`);
      } else {
        toast.error(result.error || t('invoiceNotFound'));
      }
    } catch (error) {
      console.error('Error getting invoice:', error);
      toast.error(t('errorAccessingInvoice'));
    }
  };

  const handleReorder = (order) => {
    try {
      console.log('[DEBUG] Original order data for reorder:', order);
      
      // Prepare order data for reordering
      const reorderData = {
        service: {
          id: order.service?.id || order.service_id,
          title: order.service?.title || order.service_name,
          price: order.service?.price || order.service_price,
          category: order.service?.category,
          description: order.service?.description,
          provider: order.service?.provider
        },
        location: {
          lat: order.location_lat,
          lng: order.location_lng,
          address: order.location_address
        },
        description: order.description,
        offered_price: order.offered_price,
        scheduled_time: order.scheduled_time,
        delivery_time: order.delivery_time,
        // Add any other relevant data
        original_order_id: order.id
      };

      // Save to localStorage
      localStorage.setItem('reorderData', JSON.stringify(reorderData));
      
      // Navigate to order page
      navigate('/order');
      
      console.log('[DEBUG] Reorder data saved:', reorderData);
    } catch (error) {
      console.error('Error preparing reorder data:', error);
      toast.error(t('reorderError'));
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="track-orders-container">
        <div className="loading-container">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t('loading')}</span>
            </div>
            <div className="loading-text">{t('loadingOrders')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="track-orders-container" dir="rtl">
      <div className="container-fluid">
        {/* Header */}
        <div className="track-orders-header">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <h1 className="track-orders-title mb-0">
              <BsClock className="me-2" />
              {t('trackMyOrders')}
            </h1>
            <button 
              className="btn btn-outline-primary"
              onClick={() => navigate('/home-client')}
              style={{ borderRadius: '50px', padding: '0.5rem 1.5rem' }}
            >
              <BsHouse className="me-2" />
              {t('backToHome')}
            </button>
          </div>
          <p className="track-orders-subtitle">
            {t('trackOrdersSubtitle')}
          </p>
          
          {/* Controls Section */}
          <div className="controls-section">
            <div className="control-group">
              <label>{t('language')}:</label>
              <select 
                value={language} 
                onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem('language', e.target.value);
                }}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div className="control-group">
              <label>{t('filterBy')}:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t('allOrders')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="accepted">{t('accepted')}</option>
                <option value="declined">{t('declined')}</option>
                <option value="in_progress">{t('inProgress')}</option>
                <option value="completed">{t('completed')}</option>
              </select>
            </div>
            
            <button 
              className="refresh-btn"
              onClick={fetchClientOrders}
              disabled={loading}
            >
              <BsArrowClockwise className="me-1" />
              {t('refresh')}
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="empty-state">
            <BsClock className="empty-state-icon" size={64} />
            <h3 className="empty-state-title">
              {filterStatus === 'all' ? t('noOrders') : `${t('noOrdersWithStatus')} ${getStatusText(filterStatus)}`}
            </h3>
            <p className="empty-state-description">
              {filterStatus === 'all' 
                ? t('startNewService') 
                : t('tryDifferentFilter')
              }
            </p>
          </div>
        ) : (
          <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              {/* Card Header */}
              <div className="order-card-header">
                <div>
                  <h3 className="order-number">#{order.id}</h3>
                  <p className="order-date">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <span className={`order-status-badge bg-${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Card Body */}
              <div className="order-card-body">
                {/* Service Info */}
                <div className="service-section">
                  <h4 className="service-title">
                    <BsGeoAlt className="text-primary" size={20} />
                    {order.service?.title || order.service_name || 'خدمة غير محددة'}
                  </h4>
                  <p className="service-description">
                    {order.description || 'لا يوجد وصف'}
                  </p>
                  {order.service?.category && (
                    <span className="service-category">
                      {order.service.category}
                    </span>
                  )}
                </div>

                {/* Worker Info - Enhanced */}
                {(order.worker_name || order.worker) && (
                  <div className="info-section">
                    <h5 className="info-section-title">
                      <FaUser className="me-2" size={16} />
                      {t('workerInfo')}
                    </h5>
                    <div className="info-item">
                      <span className="info-label">{t('name')}:</span>
                      <span className="info-value">
                        {order.worker_name || order.worker?.username || 'عامل غير محدد'}
                      </span>
                    </div>
                    {order.worker_phone && (
                      <div className="info-item">
                        <span className="info-label">
                          <FaPhone className="me-1" size={12} />
                          {t('phone')}:
                        </span>
                        <div className="d-flex align-items-center gap-2">
                          <span className="info-value">{order.worker_phone}</span>
                          <a 
                            href={`tel:${order.worker_phone}`} 
                            className="btn btn-sm btn-outline-success"
                            style={{ fontSize: '10px', padding: '2px 8px' }}
                          >
                            {t('call')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Location - Enhanced */}
                <div className="info-section">
                  <h5 className="info-section-title">
                    <FaMapMarkerAlt className="me-2" size={16} />
                    {t('locationDetails')}
                  </h5>
                  {order.location_address && (
                    <div className="info-item">
                      <span className="info-label">{t('address')}:</span>
                      <span className="info-value">{order.location_address}</span>
                    </div>
                  )}
                  {(order.location_lat && order.location_lng) && (
                    <div className="info-item">
                      <a 
                        href={`https://maps.google.com/maps?q=${order.location_lat},${order.location_lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        <BsGeoAlt className="me-1" size={12} />
                        {t('viewOnMap')}
                      </a>
                    </div>
                  )}
                </div>

                {/* Price Details - Enhanced */}
                <div className="info-section">
                  <h5 className="info-section-title">
                    <BsCurrencyDollar className="me-2" size={16} />
                    {t('priceDetails')}
                  </h5>
                  <div className="info-item">
                    <span className="info-label">{t('offeredPrice')}:</span>
                    <span className="info-value price-highlight">
                      {formatPrice(order.offered_price)}
                    </span>
                  </div>
                  {order.service_price && (
                    <div className="info-item">
                      <span className="info-label">{t('servicePrice')}:</span>
                      <span className="info-value price-secondary">
                        {formatPrice(order.service_price)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Timeline - Enhanced */}
                <div className="info-section">
                  <h5 className="info-section-title">
                    <BsClock className="me-2" size={16} />
                    {t('timeline')}
                  </h5>
                  <div className="timeline-item">
                    <span className="timeline-label">{t('orderDate')}:</span>
                    <span className="timeline-value">{formatDate(order.created_at)}</span>
                  </div>
                  {order.scheduled_time && (
                    <div className="timeline-item">
                      <span className="timeline-label">{t('scheduledTime')}:</span>
                      <span className="timeline-value important">
                        {formatDate(order.scheduled_time)}
                      </span>
                    </div>
                  )}
                  {order.delivery_time && (
                    <div className="timeline-item">
                      <span className="timeline-label">{t('deliveryTime')}:</span>
                      <span className="timeline-value warning">
                        {formatDate(order.delivery_time)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Decline Reason (if declined) */}
                {order.status === 'declined' && order.decline_reason && (
                  <div className="decline-reason">
                    <h6 className="decline-reason-title">
                      <BsXCircle className="me-2" size={16} />
                      {t('declineReason')}
                    </h6>
                    <p className="decline-reason-text">{order.decline_reason}</p>
                  </div>
                )}
              </div>

              {/* Card Footer - Action Buttons */}
              <div className="order-card-footer">
                {/* View Details Button */}
                <div className="action-buttons">
                  <button
                    className="action-btn btn-outline-info"
                    onClick={() => openOrderModal(order)}
                  >
                    <BsEye className="me-1" />
                    {t('viewFullDetails')}
                  </button>
                  
                  {/* Contact Worker Button for Accepted/In Progress Orders */}
                  {['accepted', 'in_progress'].includes(order.status) && (order.worker_name || order.worker) && (
                    <button
                      className="action-btn btn-primary"
                      onClick={() => handleContactWorker(order)}
                    >
                      <FaComments className="me-1" />
                      {t('contactWorker')}
                    </button>
                  )}
                  
                  {/* Complete Order Button for In Progress Orders */}
                  {order.status === 'in_progress' && (
                    <button
                      className="action-btn btn-success"
                      onClick={() => handleCompleteOrder(order.id)}
                      disabled={actionLoading[order.id]}
                    >
                      {actionLoading[order.id] === 'completing' ? (
                        <div className="spinner-border spinner-border-sm me-1" role="status" />
                      ) : (
                        <BsCheckLg className="me-1" />
                      )}
                      {t('confirmCompletion')}
                    </button>
                  )}
                  
                  {/* View Invoice Button for Completed Orders */}
                  {order.status === 'completed' && (
                    <button
                      className="action-btn btn-info"
                      onClick={() => handleViewInvoice(order.id)}
                    >
                      <FaFileInvoiceDollar className="me-1" />
                      {t('viewInvoice')}
                    </button>
                  )}
                  
                  {/* Reorder Button for Completed and Declined Orders */}
                  {['completed', 'declined'].includes(order.status) && (
                    <button
                      className="action-btn btn-warning"
                      onClick={() => handleReorder(order)}
                    >
                      <BsArrowClockwise className="me-1" />
                      {t('reorder')}
                    </button>
                  )}
                  
                  {/* Cancel Order Button for Pending Orders */}
                  {order.status === 'pending' && (
                    <button
                      className="action-btn btn-outline-danger"
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      <BsXCircle className="me-1" />
                      {t('cancelOrder')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination-container">
            <nav aria-label="تصفح الطلبات">
              <ul className="pagination">
                <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    <BsArrowRight />
                  </button>
                </li>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === pagination.totalPages || 
                    Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      <li className={`page-item ${pagination.page === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setPagination(prev => ({ ...prev, page }))}
                        >
                          {page}
                        </button>
                      </li>
                    </React.Fragment>
                  ))}
                
                <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <BsArrowLeft />
                  </button>
                </li>
              </ul>
            </nav>
            
            <div className="pagination-info">
              {t('showFrom')} {orders.length} {t('of')} {pagination.totalCount} {t('orders')}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <BsEye className="me-2" />
                  {t('orderDetails')} #{selectedOrder.id}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeOrderModal}
                  aria-label="Close"
                ></button>
              </div>
              
              <div className="modal-body">
                {/* Order Status */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6>حالة الطلب:</h6>
                      <span className={`badge bg-${getStatusColor(selectedOrder.status)} fs-6 px-3 py-2 d-flex align-items-center`}>
                        {getStatusIcon(selectedOrder.status)}
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 text-primary">
                      <BsGeoAlt className="me-2" />
                      معلومات الخدمة
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>اسم الخدمة:</strong> {selectedOrder.service?.title || selectedOrder.service_name || 'غير محدد'}</p>
                        {selectedOrder.service?.category && (
                          <p><strong>التصنيف:</strong> {selectedOrder.service.category}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        {selectedOrder.service?.description && (
                          <p><strong>وصف الخدمة:</strong> {selectedOrder.service.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <p><strong>وصف المشكلة/الطلب:</strong></p>
                        <p className="bg-light p-3 rounded">{selectedOrder.description || 'لا يوجد وصف'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Worker Information (if assigned) */}
                {(selectedOrder.worker_name || selectedOrder.worker) && (
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 text-primary">
                        <FaUser className="me-2" />
                        معلومات العامل
                      </h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>الاسم:</strong> {selectedOrder.worker_name || selectedOrder.worker?.username || 'غير محدد'}</p>
                          {selectedOrder.worker?.email && (
                            <p><strong>البريد الإلكتروني:</strong> {selectedOrder.worker.email}</p>
                          )}
                        </div>
                        <div className="col-md-6">
                          {selectedOrder.worker_phone && (
                            <div>
                              <p><strong>رقم الهاتف:</strong> {selectedOrder.worker_phone}</p>
                              <a 
                                href={`tel:${selectedOrder.worker_phone}`} 
                                className="btn btn-outline-success btn-sm"
                              >
                                <FaPhone className="me-1" />
                                اتصال مباشر
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Details */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 text-primary">
                      <FaMapMarkerAlt className="me-2" />
                      تفاصيل الموقع
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        {selectedOrder.location_address && (
                          <p><strong>العنوان:</strong> {selectedOrder.location_address}</p>
                        )}
                        {selectedOrder.building_number && (
                          <p><strong>رقم العمارة:</strong> {selectedOrder.building_number}</p>
                        )}
                        {selectedOrder.apartment_number && (
                          <p><strong>رقم الشقة:</strong> {selectedOrder.apartment_number}</p>
                        )}
                        {selectedOrder.floor_number && (
                          <p><strong>الطابق:</strong> {selectedOrder.floor_number}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        {selectedOrder.landmark && (
                          <p><strong>علامة مميزة:</strong> {selectedOrder.landmark}</p>
                        )}
                        {selectedOrder.additional_details && (
                          <p><strong>تفاصيل إضافية:</strong> {selectedOrder.additional_details}</p>
                        )}
                        {(selectedOrder.location_lat && selectedOrder.location_lng) && (
                          <div className="mt-3">
                            <a 
                              href={`https://maps.google.com/maps?q=${selectedOrder.location_lat},${selectedOrder.location_lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline-primary"
                            >
                              <BsGeoAlt className="me-1" />
                              عرض على خرائط جوجل
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price and Timeline */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 text-primary">
                          <BsCurrencyDollar className="me-2" />
                          تفاصيل السعر
                        </h6>
                      </div>
                      <div className="card-body">
                        <p><strong>السعر المعروض:</strong> 
                          <span className="text-success fs-5 fw-bold"> {formatPrice(selectedOrder.offered_price)}</span>
                        </p>
                        {selectedOrder.service_price && (
                          <p><strong>سعر الخدمة الأساسي:</strong> {formatPrice(selectedOrder.service_price)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header bg-light">
                        <h6 className="mb-0 text-primary">
                          <BsClock className="me-2" />
                          الجدول الزمني
                        </h6>
                      </div>
                      <div className="card-body">
                        <p><strong>تاريخ الطلب:</strong> {formatDate(selectedOrder.created_at)}</p>
                        {selectedOrder.scheduled_time && (
                          <p><strong>موعد التنفيذ المطلوب:</strong> 
                            <span className="text-primary fw-bold"> {formatDate(selectedOrder.scheduled_time)}</span>
                          </p>
                        )}
                        {selectedOrder.delivery_time && (
                          <p><strong>موعد التسليم المطلوب:</strong> 
                            <span className="text-warning fw-bold"> {formatDate(selectedOrder.delivery_time)}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decline Reason (if declined) */}
                {selectedOrder.status === 'declined' && selectedOrder.decline_reason && (
                  <div className="card mb-4">
                    <div className="card-header bg-danger bg-opacity-10">
                      <h6 className="mb-0 text-danger">
                        <BsXCircle className="me-2" />
                        سبب الرفض
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-0">{selectedOrder.decline_reason}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                {/* Contact Worker Button */}
                {['accepted', 'in_progress'].includes(selectedOrder.status) && (selectedOrder.worker_name || selectedOrder.worker) && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      handleContactWorker(selectedOrder);
                      closeOrderModal();
                    }}
                  >
                    <FaComments className="me-1" />
                    {t('contactWorker')}
                  </button>
                )}
                
                {/* Complete Order Button */}
                {selectedOrder.status === 'in_progress' && (
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleCompleteOrder(selectedOrder.id);
                      closeOrderModal();
                    }}
                    disabled={actionLoading[selectedOrder.id]}
                  >
                    {actionLoading[selectedOrder.id] === 'completing' ? (
                      <div className="spinner-border spinner-border-sm me-1" role="status" />
                    ) : (
                      <BsCheckLg className="me-1" />
                    )}
                    {t('confirmCompletion')}
                  </button>
                )}
                
                {/* View Invoice Button */}
                {selectedOrder.status === 'completed' && (
                  <button
                    className="btn btn-info"
                    onClick={() => {
                      handleViewInvoice(selectedOrder.id);
                      closeOrderModal();
                    }}
                  >
                    <FaFileInvoiceDollar className="me-1" />
                    {t('viewInvoice')}
                  </button>
                )}
                
                {/* Reorder Button */}
                {['completed', 'declined'].includes(selectedOrder.status) && (
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      handleReorder(selectedOrder);
                      closeOrderModal();
                    }}
                  >
                    <BsArrowClockwise className="me-1" />
                    {t('reorder')}
                  </button>
                )}
                
                {/* Cancel Order Button */}
                {selectedOrder.status === 'pending' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      handleCancelOrder(selectedOrder.id);
                      closeOrderModal();
                    }}
                  >
                    <BsXCircle className="me-1" />
                    {t('cancelOrder')}
                  </button>
                )}
                
                <button type="button" className="btn btn-secondary" onClick={closeOrderModal}>
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
