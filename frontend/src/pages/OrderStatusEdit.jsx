import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/ApiService';
import Navbar from '../components/Navbar';
import { 
  FaArrowLeft, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPlay, 
  FaStop,
  FaUser,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaDollarSign,
  FaComments
} from 'react-icons/fa';
import './OrderStatusEdit.css';

const OrderStatusEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Load order details
  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/api/orders/${id}/`);
      setOrder(response);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('خطأ في تحميل تفاصيل الطلب');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!order) return;

    setActionLoading(true);
    try {
      let endpoint;
      let successMessage;

      switch (newStatus) {
        case 'accept':
          endpoint = `/api/orders/${id}/accept/`;
          successMessage = 'تم قبول الطلب بنجاح';
          break;
        case 'decline':
          endpoint = `/api/orders/${id}/decline/`;
          successMessage = 'تم رفض الطلب';
          break;
        case 'start':
          endpoint = `/api/orders/${id}/start/`;
          successMessage = 'تم بدء العمل على الطلب';
          break;
        case 'complete':
          endpoint = `/api/orders/${id}/complete/`;
          successMessage = 'تم إكمال العمل على الطلب';
          break;
        default:
          throw new Error('إجراء غير صحيح');
      }

      const response = await apiService.post(endpoint, {});
      
      if (response) {
        toast.success(successMessage);
        // Update order status locally
        setOrder(prev => ({ ...prev, status: getNewStatus(newStatus) }));
      }
    } catch (error) {
      console.error('Error changing order status:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail || 
                          'خطأ في تغيير حالة الطلب';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const getNewStatus = (action) => {
    switch (action) {
      case 'accept': return 'accepted';
      case 'decline': return 'declined';
      case 'start': return 'in_progress';
      case 'complete': return 'completed';
      default: return order?.status;
    }
  };

  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: {
        label: 'في الانتظار',
        color: '#ffc107',
        icon: FaClock,
        description: 'الطلب في انتظار القبول'
      },
      accepted: {
        label: 'مقبول',
        color: '#17a2b8',
        icon: FaCheckCircle,
        description: 'تم قبول الطلب، يمكنك بدء العمل'
      },
      in_progress: {
        label: 'قيد التنفيذ',
        color: '#007bff',
        icon: FaPlay,
        description: 'العمل جاري على الطلب'
      },
      completed: {
        label: 'مكتمل',
        color: '#28a745',
        icon: FaCheckCircle,
        description: 'تم إكمال العمل على الطلب'
      },
      declined: {
        label: 'مرفوض',
        color: '#dc3545',
        icon: FaTimesCircle,
        description: 'تم رفض الطلب'
      },
      cancelled: {
        label: 'ملغي',
        color: '#6c757d',
        icon: FaTimesCircle,
        description: 'تم إلغاء الطلب'
      }
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const getAvailableActions = (status) => {
    switch (status) {
      case 'pending':
        return [
          { action: 'accept', label: 'قبول الطلب', color: 'success', icon: FaCheckCircle },
          { action: 'decline', label: 'رفض الطلب', color: 'danger', icon: FaTimesCircle }
        ];
      case 'accepted':
        return [
          { action: 'start', label: 'بدء العمل', color: 'primary', icon: FaPlay }
        ];
      case 'in_progress':
        return [
          { action: 'complete', label: 'إنهاء العمل', color: 'success', icon: FaStop }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="order-status-edit">
        <Navbar />
        <div className="container mt-4">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">جاري التحميل...</span>
            </div>
            <p className="mt-2">جاري تحميل تفاصيل الطلب...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-status-edit">
        <Navbar />
        <div className="container mt-4">
          <div className="text-center">
            <h3>الطلب غير موجود</h3>
            <button className="btn btn-primary" onClick={() => navigate('/orders')}>
              العودة للطلبات
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const availableActions = getAvailableActions(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="order-status-edit">
      <Navbar />
      <div className="container mt-4">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button 
            className="btn btn-outline-secondary me-3"
            onClick={() => navigate('/orders')}
          >
            <FaArrowLeft className="me-1" />
            العودة للطلبات
          </button>
          <h2 className="mb-0">إدارة حالة الطلب #{order.id}</h2>
        </div>

        <div className="row">
          {/* Order Details */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">تفاصيل الطلب</h5>
              </div>
              <div className="card-body">
                {/* Service Info */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="text-muted">اسم الخدمة</h6>
                    <p className="mb-0">{order.service_name || 'غير محدد'}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">السعر المعروض</h6>
                    <p className="mb-0 text-success">
                      <FaDollarSign className="me-1" />
                      {order.offered_price} ج.م
                    </p>
                  </div>
                </div>

                {/* Description */}
                {order.description && (
                  <div className="mb-3">
                    <h6 className="text-muted">وصف الطلب</h6>
                    <p className="mb-0">{order.description}</p>
                  </div>
                )}

                {/* Client Info */}
                <div className="row mb-3">
                  <div className="col-md-6">
                    <h6 className="text-muted">معلومات العميل</h6>
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2 text-primary" />
                      <span>{order.customer_name || 'غير محدد'}</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted">تاريخ الطلب</h6>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="me-2 text-primary" />
                      <span>{new Date(order.date_created).toLocaleDateString('ar-EG')}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {order.location_address && (
                  <div className="mb-3">
                    <h6 className="text-muted">الموقع</h6>
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      <span>{order.location_address}</span>
                    </div>
                  </div>
                )}

                {/* Scheduled Time */}
                {order.scheduled_time && (
                  <div className="mb-3">
                    <h6 className="text-muted">موعد الخدمة المطلوب</h6>
                    <div className="d-flex align-items-center">
                      <FaClock className="me-2 text-primary" />
                      <span>{new Date(order.scheduled_time).toLocaleString('ar-EG')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">حالة الطلب</h5>
              </div>
              <div className="card-body">
                {/* Current Status */}
                <div className="text-center mb-4">
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: statusInfo.color }}
                  >
                    <StatusIcon className="me-2" />
                    {statusInfo.label}
                  </div>
                  <p className="text-muted mt-2">{statusInfo.description}</p>
                </div>

                {/* Available Actions */}
                {availableActions.length > 0 && (
                  <div>
                    <h6 className="mb-3">الإجراءات المتاحة</h6>
                    <div className="d-grid gap-2">
                      {availableActions.map((action) => {
                        const ActionIcon = action.icon;
                        return (
                          <button
                            key={action.action}
                            className={`btn btn-${action.color} btn-lg`}
                            onClick={() => handleStatusChange(action.action)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <div className="spinner-border spinner-border-sm me-2" role="status" />
                            ) : (
                              <ActionIcon className="me-2" />
                            )}
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Contact Client Button */}
                <div className="mt-3">
                  <button 
                    className="btn btn-outline-primary w-100"
                    onClick={() => navigate(`/messages?orderId=${order.id}`)}
                  >
                    <FaComments className="me-2" />
                    تواصل مع العميل
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusEdit;

