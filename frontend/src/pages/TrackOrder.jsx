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
  BsArrowClockwise
} from "react-icons/bs";
import { FaMapMarkerAlt, FaPhone, FaUser, FaComments, FaTools, FaFileInvoiceDollar } from "react-icons/fa";
import { toast } from 'react-toastify';
import InvoiceService from '../services/InvoiceService';
import "./Orders.css";

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
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

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
      toast.error("خطأ في تحميل الطلبات");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, pagination.page]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && user.role === 'client') {
      fetchClientOrders();
    } else {
      toast.error("هذه الصفحة مخصصة للعملاء فقط");
      navigate('/');
    }
  }, [fetchClientOrders, navigate]);

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
      case 'pending': return 'في الانتظار';
      case 'accepted': return 'مقبول';
      case 'declined': return 'مرفوض';
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
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
    if (!window.confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
      return;
    }

    try {
      await apiService.delete(`/api/orders/${orderId}/`);
      toast.success('تم إلغاء الطلب بنجاح');
      fetchClientOrders(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('خطأ في إلغاء الطلب');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm('هل أنت متأكد من تأكيد اكتمال هذا الطلب؟ سيتم إنشاء فاتورة تلقائياً.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [orderId]: 'completing' }));
    
    try {
      const response = await apiService.post(`/api/orders/${orderId}/complete/`, {});
      
      if (response) {
        toast.success('تم تأكيد اكتمال الطلب بنجاح! تم إنشاء الفاتورة تلقائياً.');
        fetchClientOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error completing order:', error);
      toast.error(
        error.response?.data?.error || 'خطأ في تأكيد اكتمال الطلب'
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
        toast.error(result.error || 'لم يتم العثور على فاتورة لهذا الطلب');
      }
    } catch (error) {
      console.error('Error getting invoice:', error);
      toast.error('خطأ في الوصول للفاتورة');
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
      toast.error('حدث خطأ أثناء إعداد إعادة الطلب');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <div className="mt-3">جاري تحميل طلباتك...</div>
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
              تتبع طلباتي
            </h1>
            
            {/* Filter */}
            <div className="d-flex gap-2">
              <select 
                className="form-select form-select-sm" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">جميع الطلبات</option>
                <option value="pending">في الانتظار</option>
                <option value="accepted">مقبولة</option>
                <option value="declined">مرفوضة</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتملة</option>
              </select>
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={fetchClientOrders}
                disabled={loading}
              >
                تحديث
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
            {filterStatus === 'all' ? 'لا توجد طلبات' : `لا توجد طلبات ${getStatusText(filterStatus)}`}
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
                  <span className={`badge bg-${getStatusColor(order.status)} d-flex align-items-center`}>
                    {getStatusIcon(order.status)}
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
                      <strong>الوصف:</strong> {order.description || 'لا يوجد وصف'}
                    </p>
                    {order.service?.category && (
                      <p className="card-text text-muted small mb-0">
                        <strong>التصنيف:</strong> {order.service.category}
                      </p>
                    )}
                  </div>

                  {/* Worker Info - Enhanced */}
                  {(order.worker_name || order.worker) && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <h6 className="text-primary mb-2">
                        <FaUser className="me-2" size={14} />
                        معلومات العامل
                      </h6>
                      <div className="d-flex align-items-center mb-2">
                        <span className="small text-muted me-2">الاسم:</span>
                        <span className="small fw-bold">
                          {order.worker_name || order.worker?.username || 'عامل غير محدد'}
                        </span>
                      </div>
                      {order.worker_phone && (
                        <div className="d-flex align-items-center mb-2">
                          <FaPhone className="text-muted me-2" size={12} />
                          <span className="small">{order.worker_phone}</span>
                          <a 
                            href={`tel:${order.worker_phone}`} 
                            className="btn btn-sm btn-outline-success ms-2"
                            style={{ fontSize: '10px', padding: '2px 8px' }}
                          >
                            اتصال
                          </a>
                        </div>
                      )}
                    </div>
                  )}

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
                      <span className="small text-muted">السعر المعروض:</span>
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
                  </div>

                  {/* Decline Reason (if declined) */}
                  {order.status === 'declined' && order.decline_reason && (
                    <div className="mb-3 p-3 bg-danger bg-opacity-10 rounded border border-danger border-opacity-25">
                      <h6 className="text-danger mb-2">
                        <BsXCircle className="me-2" size={14} />
                        سبب الرفض
                      </h6>
                      <p className="small mb-0">{order.decline_reason}</p>
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
                      عرض التفاصيل الكاملة
                    </button>
                  </div>
                  
                  {/* Contact Worker Button for Accepted/In Progress Orders */}
                  {['accepted', 'in_progress'].includes(order.status) && (order.worker_name || order.worker) && (
                    <div className="d-flex gap-2 mb-2">
                      <button
                        className="btn btn-primary btn-sm flex-fill"
                        onClick={() => handleContactWorker(order)}
                      >
                        <FaComments className="me-1" />
                        تواصل مع العامل
                      </button>
                    </div>
                  )}
                  
                  {/* Complete Order Button for In Progress Orders */}
                  {order.status === 'in_progress' && (
                    <div className="d-flex gap-2 mb-2">
                      <button
                        className="btn btn-success btn-sm flex-fill"
                        onClick={() => handleCompleteOrder(order.id)}
                        disabled={actionLoading[order.id]}
                      >
                        {actionLoading[order.id] === 'completing' ? (
                          <div className="spinner-border spinner-border-sm me-1" role="status" />
                        ) : (
                          <BsCheckLg className="me-1" />
                        )}
                        تأكيد الاكتمال
                      </button>
                    </div>
                  )}
                  
                  {/* View Invoice Button for Completed Orders */}
                  {order.status === 'completed' && (
                    <div className="d-flex gap-2 mb-2">
                      <button
                        className="btn btn-info btn-sm flex-fill"
                        onClick={() => handleViewInvoice(order.id)}
                      >
                        <FaFileInvoiceDollar className="me-1" />
                        عرض الفاتورة
                      </button>
                    </div>
                  )}
                  
                  {/* Reorder Button for Completed and Declined Orders */}
                  {['completed', 'declined'].includes(order.status) && (
                    <div className="d-flex gap-2 mb-2">
                      <button
                        className="btn btn-warning btn-sm flex-fill"
                        onClick={() => handleReorder(order)}
                      >
                        <BsArrowClockwise className="me-1" />
                        إعادة الطلب
                      </button>
                    </div>
                  )}
                  
                  {/* Cancel Order Button for Pending Orders */}
                  {order.status === 'pending' && (
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-danger btn-sm flex-fill"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        <BsXCircle className="me-1" />
                        إلغاء الطلب
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
                    تواصل مع العامل
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
                    تأكيد الاكتمال
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
                    عرض الفاتورة
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
                    إعادة الطلب
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
                    إلغاء الطلب
                  </button>
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

export default TrackOrder;
