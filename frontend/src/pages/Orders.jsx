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
  BsArrowRight
} from "react-icons/bs";
import { FaMapMarkerAlt, FaPhone, FaUser, FaComments } from "react-icons/fa";
import { toast } from 'react-toastify';
import "./Orders.css";

// Translation object
const translations = {
  ar: {
    orders: "الطلبات",
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
    clientInfo: "معلومات العميل",
    name: "الاسم",
    email: "البريد",
    phone: "الهاتف",
    call: "اتصال",
    locationDetails: "تفاصيل الموقع",
    address: "العنوان",
    buildingNumber: "رقم العمارة",
    apartmentNumber: "رقم الشقة",
    floor: "الطابق",
    landmark: "علامة مميزة",
    additionalDetails: "تفاصيل إضافية",
    viewOnMap: "عرض على الخريطة",
    priceDetails: "تفاصيل السعر",
    offeredPrice: "السعر المعروض من العميل",
    servicePrice: "سعر الخدمة الأساسي",
    estimatedDuration: "المدة المتوقعة",
    timeline: "الجدول الزمني",
    orderDate: "تاريخ الطلب",
    scheduledTime: "موعد التنفيذ المطلوب",
    deliveryTime: "موعد التسليم المطلوب",
    lastUpdate: "آخر تحديث",
    specialRequirements: "متطلبات خاصة",
    specialReqs: "متطلبات خاصة",
    materialsNeeded: "مواد مطلوبة",
    toolsRequired: "أدوات مطلوبة",
    orderPriority: "أولوية الطلب",
    urgent: "عاجل جداً",
    high: "عاجل",
    low: "غير عاجل",
    viewFullDetails: "عرض التفاصيل الكاملة",
    accept: "قبول",
    decline: "رفض",
    contactClient: "تواصل مع العميل",
    startWork: "بدء العمل",
    orderDetails: "تفاصيل الطلب",
    orderStatus: "حالة الطلب",
    serviceInfo: "معلومات الخدمة",
    serviceName: "اسم الخدمة",
    serviceDescription: "وصف الخدمة",
    problemDescription: "وصف المشكلة/الطلب",
    clientName: "الاسم",
    clientEmail: "البريد الإلكتروني",
    clientPhone: "رقم الهاتف",
    directCall: "اتصال مباشر",
    priceOffered: "السعر المعروض من العميل",
    acceptOrder: "قبول الطلب",
    declineOrder: "رفض الطلب",
    close: "إغلاق",
    loading: "جاري التحميل...",
    loadingOrders: "جاري تحميل الطلبات...",
    showFrom: "عرض",
    of: "من أصل",
    order: "طلب",
    errorLoadingOrders: "خطأ في تحميل الطلبات",
    orderAccepted: "تم قبول الطلب بنجاح!",
    orderDeclined: "تم رفض الطلب!",
    errorAccepting: "خطأ في قبول الطلب",
    errorDeclining: "خطأ في رفض الطلب",
    invalidRequest: "طلب غير صحيح",
    accessDenied: "تم رفض الوصول",
    workerOnlyAction: "هذا الإجراء متاح للعمال فقط",
    orderNotFound: "الطلب غير موجود",
    orderMayBeDeleted: "قد يكون الطلب محذوفاً",
    invalidOrderStatus: "حالة الطلب غير صحيحة",
    checkOrderStatus: "تحقق من حالة الطلب",
    serverError: "خطأ في الخادم",
    tryAgainLater: "حاول مرة أخرى لاحقاً",
    networkError: "خطأ في الشبكة",
    checkConnection: "تحقق من اتصالك بالإنترنت",
    workerOnlyPage: "هذه الصفحة مخصصة للعمال. يتم توجيهك إلى صفحة تتبع الطلبات."
  },
  en: {
    orders: "Orders",
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
    clientInfo: "Client Information",
    name: "Name",
    email: "Email",
    phone: "Phone",
    call: "Call",
    locationDetails: "Location Details",
    address: "Address",
    buildingNumber: "Building Number",
    apartmentNumber: "Apartment Number",
    floor: "Floor",
    landmark: "Landmark",
    additionalDetails: "Additional Details",
    viewOnMap: "View on Map",
    priceDetails: "Price Details",
    offeredPrice: "Price Offered by Client",
    servicePrice: "Base Service Price",
    estimatedDuration: "Estimated Duration",
    timeline: "Timeline",
    orderDate: "Order Date",
    scheduledTime: "Scheduled Time",
    deliveryTime: "Delivery Time",
    lastUpdate: "Last Update",
    specialRequirements: "Special Requirements",
    specialReqs: "Special Requirements",
    materialsNeeded: "Materials Needed",
    toolsRequired: "Tools Required",
    orderPriority: "Order Priority",
    urgent: "Very Urgent",
    high: "High",
    low: "Low",
    viewFullDetails: "View Full Details",
    accept: "Accept",
    decline: "Decline",
    contactClient: "Contact Client",
    startWork: "Start Work",
    orderDetails: "Order Details",
    orderStatus: "Order Status",
    serviceInfo: "Service Information",
    serviceName: "Service Name",
    serviceDescription: "Service Description",
    problemDescription: "Problem/Order Description",
    clientName: "Name",
    clientEmail: "Email",
    clientPhone: "Phone",
    directCall: "Direct Call",
    priceOffered: "Price Offered by Client",
    acceptOrder: "Accept Order",
    declineOrder: "Decline Order",
    close: "Close",
    loading: "Loading...",
    loadingOrders: "Loading orders...",
    showFrom: "Showing",
    of: "of",
    order: "orders",
    errorLoadingOrders: "Error loading orders",
    orderAccepted: "Order accepted successfully!",
    orderDeclined: "Order declined!",
    errorAccepting: "Error accepting order",
    errorDeclining: "Error declining order",
    invalidRequest: "Invalid request",
    accessDenied: "Access denied",
    workerOnlyAction: "This action is only available for workers",
    orderNotFound: "Order not found",
    orderMayBeDeleted: "Order may have been deleted",
    invalidOrderStatus: "Invalid order status",
    checkOrderStatus: "Check order status",
    serverError: "Server error",
    tryAgainLater: "Try again later",
    networkError: "Network error",
    checkConnection: "Check your internet connection",
    workerOnlyPage: "This page is for workers only. Redirecting you to order tracking page."
  }
};

// Create ApiService instance outside component to avoid recreation
const apiService = new ApiService();

const Orders = () => {
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

  const fetchWorkerOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        page_size: 10,
        worker_only: 'true' // Filter for orders relevant to this worker
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
      console.error("Error fetching worker orders:", err);
      toast.error(t('errorLoadingOrders'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, pagination.page, t]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      // Check if user is a worker, if not redirect to appropriate page
      if (user.role !== 'worker') {
        if (user.role === 'client') {
          toast.info(t('workerOnlyPage'));
          navigate('/track-order');
        } else {
          navigate('/');
        }
        return;
      }
      fetchWorkerOrders();
    } else {
      navigate('/auth');
    }
  }, [fetchWorkerOrders, navigate, t]);

  const handleOrderAction = async (orderId, action) => {
    if (!orderId || !action) {
      toast.error(t('invalidRequest'));
      return;
    }

    setActionLoading(prev => ({ ...prev, [orderId]: action }));
    
    try {
      let endpoint;
      if (action === 'accept') {
        endpoint = `/api/orders/${orderId}/accept/`;
      } else if (action === 'decline') {
        endpoint = `/api/orders/${orderId}/decline/`;
      } else if (action === 'start') {
        endpoint = `/api/orders/${orderId}/start/`;
      } else {
        toast.error(t('invalidAction'));
        return;
      }
      
      console.log(`[DEBUG] Attempting to ${action} order ${orderId}...`);
      console.log(`[DEBUG] Request details:`, {
        orderId,
        action,
        endpoint,
        timestamp: new Date().toISOString(),
        userRole: localStorage.getItem('user_role'),
        userId: localStorage.getItem('user_id')
      });
      
      const response = await apiService.post(endpoint, {});
      
      if (response) {
        console.log(`[DEBUG] ${action} order response:`, response);
        
        // Show success message with more details
        const successMessage = response.message || 
          (action === 'accept' ? t('orderAccepted') : t('orderDeclined'));
        
        toast.success(successMessage, {
          duration: 4000,
          position: "top-center"
        });
        
        // Refresh orders list
        fetchWorkerOrders();
      }
    } catch (error) {
      console.error(`[ERROR] Error ${action}ing order ${orderId}:`, error);
      
      // Extract detailed error information
      const errorResponse = error.response?.data;
      const statusCode = error.response?.status;
      
      let errorMessage = '';
      let errorDetails = '';
      
      if (errorResponse) {
        // Handle structured error responses from backend
        errorMessage = errorResponse.error || errorResponse.detail || errorResponse.message;
        errorDetails = errorResponse.details || errorResponse.current_status || errorResponse.assigned_worker;
        
        // Show specific error messages based on status code
        if (statusCode === 403) {
          if (errorResponse.details && errorResponse.details.includes('role')) {
            errorMessage = t('insufficientPermissions');
            errorDetails = t('workerRoleRequired');
          } else if (errorResponse.details && errorResponse.details.includes('assigned')) {
            errorMessage = t('orderAlreadyAssigned');
            errorDetails = t('orderAssignedToAnotherWorker');
          } else {
            errorMessage = t('accessDenied');
            errorDetails = errorResponse.details || t('workerOnlyAction');
          }
        } else if (statusCode === 404) {
          errorMessage = t('orderNotFound');
          errorDetails = t('orderMayBeDeleted');
        } else if (statusCode === 400) {
          if (errorResponse.details && errorResponse.details.includes('status')) {
            errorMessage = t('invalidOrderStatus');
            errorDetails = `${t('currentStatus')}: ${errorResponse.current_status || 'unknown'}. ${t('expectedStatus')}: pending`;
          } else if (errorResponse.details && errorResponse.details.includes('assigned')) {
            errorMessage = t('orderAlreadyAssigned');
            errorDetails = `${t('assignedTo')}: ${errorResponse.assigned_worker || 'unknown worker'}`;
          } else {
            errorMessage = errorResponse.error || t('invalidRequest');
            errorDetails = errorResponse.details || t('checkOrderStatus');
          }
        } else if (statusCode === 500) {
          errorMessage = t('serverError');
          errorDetails = errorResponse.details || t('tryAgainLater');
        } else if (statusCode === 401) {
          errorMessage = t('authenticationRequired');
          errorDetails = t('pleaseLoginAgain');
        } else if (statusCode === 429) {
          errorMessage = t('tooManyRequests');
          errorDetails = t('pleaseWaitBeforeRetrying');
        } else if (statusCode >= 500) {
          errorMessage = t('serverError');
          errorDetails = `${t('errorCode')}: ${statusCode}. ${t('contactSupport')}`;
        } else {
          errorMessage = errorResponse.error || t('unknownError');
          errorDetails = errorResponse.details || t('unexpectedErrorOccurred');
        }
      } else if (error.message === 'Network Error') {
        errorMessage = t('networkError');
        errorDetails = t('checkConnection');
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = t('requestTimeout');
        errorDetails = t('serverTakingTooLong');
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = t('networkConnectionFailed');
        errorDetails = t('checkInternetConnection');
      } else if (error.code === 'ERR_BAD_RESPONSE') {
        errorMessage = t('invalidServerResponse');
        errorDetails = t('serverReturnedInvalidData');
      } else {
        errorMessage = action === 'accept' ? t('errorAccepting') : t('errorDeclining');
        errorDetails = t('tryAgainLater');
      }
      
      // Show detailed error toast
      toast.error(
        <div>
          <div className="fw-bold">{errorMessage}</div>
          {errorDetails && <div className="small text-muted mt-1">{errorDetails}</div>}
        </div>,
        {
          duration: 6000,
          position: "top-center"
        }
      );
      
      // Log detailed error for debugging
      console.error(`[ERROR] Detailed error info:`, {
        statusCode,
        errorResponse,
        errorMessage,
        errorDetails,
        orderId,
        action,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      // Additional debugging for specific error types
      if (statusCode === 500) {
        console.error(`[ERROR] Server Error Details:`, {
          orderId,
          action,
          errorResponse,
          requestData: { orderId, action },
          timestamp: new Date().toISOString()
        });
      }
      
      if (statusCode === 400 && errorResponse?.details?.includes('status')) {
        console.warn(`[WARNING] Order Status Issue:`, {
          orderId,
          currentStatus: errorResponse.current_status,
          expectedStatus: 'pending',
          action,
          message: 'Order may already be processed'
        });
      }
      
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

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

  const handleContactClient = (order) => {
    // Navigate to messages page with specific order ID
    navigate('/messages', { 
      state: { 
        orderId: order.id,
        clientName: order.customer_first_name && order.customer_last_name 
          ? `${order.customer_first_name} ${order.customer_last_name}`
          : order.customer_name || 'عميل غير محدد',
        serviceName: order.service?.title || order.service_name || 'خدمة غير محددة'
      } 
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('loading')}</span>
          </div>
          <div className="mt-3">{t('loadingOrders')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" dir="rtl">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h3 mb-0">
              <BsClock className="me-2 text-primary" />
              {t('orders')}
            </h1>
            
            {/* Language Toggle and Filter */}
            <div className="d-flex gap-2">
              <select 
                className="form-select form-select-sm" 
                value={language} 
                onChange={(e) => {
                  setLanguage(e.target.value);
                  localStorage.setItem('language', e.target.value);
                }}
                style={{ width: 'auto' }}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
              <select 
                className="form-select form-select-sm" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">{t('allOrders')}</option>
                <option value="pending">{t('pending')}</option>
                <option value="accepted">{t('accepted')}</option>
                <option value="declined">{t('declined')}</option>
                <option value="in_progress">{t('inProgress')}</option>
                <option value="completed">{t('completed')}</option>
              </select>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchWorkerOrders}
                disabled={loading}
              >
                {t('refresh')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <BsClock className="text-muted mb-3" size={48} />
          <div className="text-muted">
            {filterStatus === 'all' ? t('noOrders') : `${t('noOrdersWithStatus')} ${getStatusText(filterStatus)}`}
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.id} className="col-12 col-lg-6 col-xl-4">
              <div className="card h-100 shadow-sm border-0">
                {/* Card Header */}
                <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <strong className="text-primary">#{order.id}</strong>
                    <span className="ms-2 text-muted small">
                      {formatDate(order.created_at)}
                    </span>
                  </div>
                  <span className={`badge bg-${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="card-body">
                  {/* Service Info */}
                  <div className="mb-3">
                    <h6 className="card-title text-dark mb-2">
                      <BsGeoAlt className="text-primary me-2" size={16} />
                      {order.service?.title || order.service_name || 'خدمة غير محددة'}
                    </h6>
                    <p className="card-text text-muted small mb-2">
                      <strong>{t('description')}:</strong> {order.description || 'لا يوجد وصف'}
                    </p>
                    {order.service?.category && (
                      <p className="card-text text-muted small mb-0">
                        <strong>{t('category')}:</strong> {order.service.category}
                      </p>
                    )}
                  </div>

                  {/* Client Info - Enhanced */}
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6 className="text-primary mb-2">
                      <FaUser className="me-2" size={14} />
                      {t('clientInfo')}
                    </h6>
                    <div className="row">
                      <div className="col-12">
                        <div className="d-flex align-items-center mb-2">
                          <span className="small text-muted me-2">{t('name')}:</span>
                          <span className="small fw-bold">
                            {order.customer_first_name && order.customer_last_name 
                              ? `${order.customer_first_name} ${order.customer_last_name}`
                              : order.customer_name || 'عميل غير محدد'
                            }
                          </span>
                        </div>
                        {order.customer_email && (
                          <div className="d-flex align-items-center mb-2">
                            <span className="small text-muted me-2">{t('email')}:</span>
                            <span className="small">{order.customer_email}</span>
                          </div>
                        )}
                        {order.customer_phone && (
                          <div className="d-flex align-items-center mb-2">
                            <FaPhone className="text-muted me-2" size={12} />
                            <span className="small">{order.customer_phone}</span>
                            <a 
                              href={`tel:${order.customer_phone}`} 
                              className="btn btn-sm btn-outline-success ms-2"
                              style={{ fontSize: '10px', padding: '2px 8px' }}
                            >
                              {t('call')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location - Enhanced */}
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6 className="text-primary mb-2">
                      <FaMapMarkerAlt className="me-2" size={14} />
                      تفاصيل الموقع
                    </h6>
                    {order.location_address && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">العنوان:</span>
                        <span className="small">{order.location_address}</span>
                      </div>
                    )}
                    {order.building_number && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">رقم العمارة:</span>
                        <span className="small">{order.building_number}</span>
                      </div>
                    )}
                    {order.apartment_number && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">رقم الشقة:</span>
                        <span className="small">{order.apartment_number}</span>
                      </div>
                    )}
                    {order.floor_number && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">الطابق:</span>
                        <span className="small">{order.floor_number}</span>
                      </div>
                    )}
                    {order.landmark && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">علامة مميزة:</span>
                        <span className="small">{order.landmark}</span>
                      </div>
                    )}
                    {order.additional_details && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">تفاصيل إضافية:</span>
                        <span className="small">{order.additional_details}</span>
                      </div>
                    )}
                    {(order.location_lat && order.location_lng) && (
                      <div className="mt-2">
                        <a 
                          href={`https://maps.google.com/maps?q=${order.location_lat},${order.location_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          <BsGeoAlt className="me-1" size={12} />
                          عرض على الخريطة
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Price Details - Enhanced */}
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6 className="text-primary mb-2">
                      <BsCurrencyDollar className="me-2" size={14} />
                      تفاصيل السعر
                    </h6>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small text-muted">السعر المعروض من العميل:</span>
                      <span className="fw-bold text-success fs-6">
                        {formatPrice(order.offered_price)}
                      </span>
                    </div>
                    {order.service_price && (
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted">سعر الخدمة الأساسي:</span>
                        <span className="small text-info">
                          {formatPrice(order.service_price)}
                        </span>
                      </div>
                    )}
                    {order.estimated_duration && (
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small text-muted">المدة المتوقعة:</span>
                        <span className="small">{order.estimated_duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Timeline - Enhanced */}
                  <div className="mb-3 p-3 bg-light rounded">
                    <h6 className="text-primary mb-2">
                      <BsClock className="me-2" size={14} />
                      الجدول الزمني
                    </h6>
                    <div className="mb-2">
                      <span className="small text-muted me-2">تاريخ الطلب:</span>
                      <span className="small">{formatDate(order.created_at)}</span>
                    </div>
                    {order.scheduled_time && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">موعد التنفيذ المطلوب:</span>
                        <span className="small fw-bold text-primary">
                          {formatDate(order.scheduled_time)}
                        </span>
                      </div>
                    )}
                    {order.delivery_time && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">موعد التسليم المطلوب:</span>
                        <span className="small fw-bold text-warning">
                          {formatDate(order.delivery_time)}
                        </span>
                      </div>
                    )}
                    {order.updated_at && order.updated_at !== order.created_at && (
                      <div className="mb-2">
                        <span className="small text-muted me-2">آخر تحديث:</span>
                        <span className="small">{formatDate(order.updated_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Additional Details */}
                  {(order.special_requirements || order.materials_needed || order.tools_required) && (
                    <div className="mb-3 p-3 bg-warning bg-opacity-10 rounded border border-warning border-opacity-25">
                      <h6 className="text-warning mb-2">
                        <BsEye className="me-2" size={14} />
                        متطلبات خاصة
                      </h6>
                      {order.special_requirements && (
                        <div className="mb-2">
                          <span className="small text-muted me-2">متطلبات خاصة:</span>
                          <span className="small">{order.special_requirements}</span>
                        </div>
                      )}
                      {order.materials_needed && (
                        <div className="mb-2">
                          <span className="small text-muted me-2">مواد مطلوبة:</span>
                          <span className="small">{order.materials_needed}</span>
                        </div>
                      )}
                      {order.tools_required && (
                        <div className="mb-2">
                          <span className="small text-muted me-2">أدوات مطلوبة:</span>
                          <span className="small">{order.tools_required}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Priority */}
                  {order.priority && order.priority !== 'normal' && (
                    <div className="mb-3">
                      <span className={`badge ${
                        order.priority === 'urgent' ? 'bg-danger' :
                        order.priority === 'high' ? 'bg-warning' : 'bg-info'
                      }`}>
                        {order.priority === 'urgent' ? 'عاجل جداً' :
                         order.priority === 'high' ? 'عاجل' : 
                         order.priority === 'low' ? 'غير عاجل' : order.priority}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer - Action Buttons */}
                <div className="card-footer bg-light border-0">
                  {/* View Details Button */}
                  <div className="d-flex gap-2 mb-2">
                    <button
                      className="btn btn-outline-info btn-sm flex-fill"
                      onClick={() => openOrderModal(order)}
                    >
                      <BsEye className="me-1" />
                      {t('viewFullDetails')}
                    </button>
                  </div>
                  
                  {/* Accept/Decline Buttons for Pending Orders */}
                  {order.status === 'pending' && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => handleOrderAction(order.id, 'accept')}
                        disabled={actionLoading[order.id]}
                      >
                        {actionLoading[order.id] === 'accept' ? (
                          <div className="spinner-border spinner-border-sm me-1" role="status" />
                        ) : (
                          <BsCheckCircle className="me-1" />
                        )}
                        قبول
                      </button>
                      <button
                        className="btn btn-danger btn-sm flex-fill"
                        onClick={() => handleOrderAction(order.id, 'decline')}
                        disabled={actionLoading[order.id]}
                      >
                        {actionLoading[order.id] === 'decline' ? (
                          <div className="spinner-border spinner-border-sm me-1" role="status" />
                        ) : (
                          <BsXCircle className="me-1" />
                        )}
                        رفض
                      </button>
                    </div>
                  )}
                  
                  {/* Additional Actions for Accepted Orders */}
                  {order.status === 'accepted' && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => handleContactClient(order)}
                      >
                        <FaComments className="me-1" />
                        تواصل مع العميل
                      </button>
                      <button
                        className="btn btn-warning btn-sm flex-fill"
                        onClick={() => handleOrderAction(order.id, 'start')}
                        disabled={actionLoading[order.id]}
                      >
                        بدء العمل
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav aria-label="تصفح الطلبات">
              <ul className="pagination justify-content-center">
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
            
            <div className="text-center text-muted small">
              عرض {orders.length} من أصل {pagination.totalCount} طلب
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <BsEye className="me-2" />
                  تفاصيل الطلب #{selectedOrder.id}
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
                      <span className={`badge bg-${getStatusColor(selectedOrder.status)} fs-6 px-3 py-2`}>
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

                {/* Client Information */}
                <div className="card mb-4">
                  <div className="card-header bg-light">
                    <h6 className="mb-0 text-primary">
                      <FaUser className="me-2" />
                      معلومات العميل
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>الاسم:</strong> {
                          selectedOrder.customer?.first_name && selectedOrder.customer?.last_name 
                            ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}`
                            : selectedOrder.customer?.name || selectedOrder.customer?.username || 'غير محدد'
                        }</p>
                        {selectedOrder.customer?.email && (
                          <p><strong>البريد الإلكتروني:</strong> {selectedOrder.customer.email}</p>
                        )}
                      </div>
                      <div className="col-md-6">
                        {selectedOrder.customer?.phone && (
                          <div>
                            <p><strong>رقم الهاتف:</strong> {selectedOrder.customer.phone}</p>
                            <a 
                              href={`tel:${selectedOrder.customer.phone}`} 
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
                        <p><strong>السعر المعروض من العميل:</strong> 
                          <span className="text-success fs-5 fw-bold"> {formatPrice(selectedOrder.offered_price)}</span>
                        </p>
                        {selectedOrder.service_price && (
                          <p><strong>سعر الخدمة الأساسي:</strong> {formatPrice(selectedOrder.service_price)}</p>
                        )}
                        {selectedOrder.estimated_duration && (
                          <p><strong>المدة المتوقعة:</strong> {selectedOrder.estimated_duration}</p>
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

                {/* Special Requirements */}
                {(selectedOrder.special_requirements || selectedOrder.materials_needed || selectedOrder.tools_required) && (
                  <div className="card mb-4">
                    <div className="card-header bg-warning bg-opacity-10">
                      <h6 className="mb-0 text-warning">
                        <BsEye className="me-2" />
                        متطلبات خاصة
                      </h6>
                    </div>
                    <div className="card-body">
                      {selectedOrder.special_requirements && (
                        <p><strong>متطلبات خاصة:</strong> {selectedOrder.special_requirements}</p>
                      )}
                      {selectedOrder.materials_needed && (
                        <p><strong>مواد مطلوبة:</strong> {selectedOrder.materials_needed}</p>
                      )}
                      {selectedOrder.tools_required && (
                        <p><strong>أدوات مطلوبة:</strong> {selectedOrder.tools_required}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Priority */}
                {selectedOrder.priority && selectedOrder.priority !== 'normal' && (
                  <div className="card mb-4">
                    <div className="card-header bg-light">
                      <h6 className="mb-0 text-primary">أولوية الطلب</h6>
                    </div>
                    <div className="card-body">
                      <span className={`badge fs-6 px-3 py-2 ${
                        selectedOrder.priority === 'urgent' ? 'bg-danger' :
                        selectedOrder.priority === 'high' ? 'bg-warning' : 'bg-info'
                      }`}>
                        {selectedOrder.priority === 'urgent' ? 'عاجل جداً' :
                         selectedOrder.priority === 'high' ? 'عاجل' : 
                         selectedOrder.priority === 'low' ? 'غير عاجل' : selectedOrder.priority}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleOrderAction(selectedOrder.id, 'accept');
                        closeOrderModal();
                      }}
                      disabled={actionLoading[selectedOrder.id]}
                    >
                      {actionLoading[selectedOrder.id] === 'accept' ? (
                        <div className="spinner-border spinner-border-sm me-1" role="status" />
                      ) : (
                        <BsCheckCircle className="me-1" />
                      )}
                      قبول الطلب
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        handleOrderAction(selectedOrder.id, 'decline');
                        closeOrderModal();
                      }}
                      disabled={actionLoading[selectedOrder.id]}
                    >
                      {actionLoading[selectedOrder.id] === 'decline' ? (
                        <div className="spinner-border spinner-border-sm me-1" role="status" />
                      ) : (
                        <BsXCircle className="me-1" />
                      )}
                      رفض الطلب
                    </button>
                  </>
                )}
                <button type="button" className="btn btn-secondary" onClick={closeOrderModal}>
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;