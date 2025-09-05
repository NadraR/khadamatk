import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaClipboardList, 
  FaHeart, 
  FaFileInvoiceDollar, 
  FaStar, 
  FaComments,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaChartLine,
  FaTrophy,
  FaGift,
  FaReceipt,
  FaMapMarkerAlt
} from 'react-icons/fa';
import apiService from '../services/ApiService';
import invoiceService from '../services/InvoiceService';
import Navbar from '../components/Navbar';
import './HomeClient.css';

// Import images (you can add actual images later)
const clientHeroImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23f0f8ff"/><circle cx="200" cy="150" r="80" fill="%234da6ff" opacity="0.3"/><circle cx="600" cy="400" r="120" fill="%230077ff" opacity="0.2"/><rect x="100" y="200" width="600" height="200" rx="20" fill="%23ffffff" opacity="0.9"/><text x="400" y="320" text-anchor="middle" fill="%230077ff" font-size="32" font-weight="bold">مرحباً بك في لوحة التحكم</text></svg>';

const serviceImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e3f2fd"/><circle cx="100" cy="100" r="40" fill="%230077ff" opacity="0.6"/><circle cx="300" cy="200" r="60" fill="%234da6ff" opacity="0.4"/><rect x="50" y="120" width="300" height="120" rx="15" fill="%23ffffff"/><text x="200" y="190" text-anchor="middle" fill="%230077ff" font-size="18" font-weight="bold">خدماتك</text></svg>';

const achievementImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fff3cd"/><polygon points="200,50 220,120 290,120 235,165 255,235 200,190 145,235 165,165 110,120 180,120" fill="%23f59e0b"/><text x="200" y="280" text-anchor="middle" fill="%23856404" font-size="16" font-weight="bold">إنجازاتك</text></svg>';

const HomeClient = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    avgRating: 0
  });
  
  const [statistics, setStatistics] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalAmount: 0
  });
  
  // Filter state for orders
  const [orderFilter, setOrderFilter] = useState('all');

  // Function to filter orders based on selected status
  const getFilteredOrders = () => {
    if (orderFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === orderFilter);
  };

  // Handle order filter change
  const handleOrderFilterChange = (e) => {
    setOrderFilter(e.target.value);
  };

  // Get filter status text in Arabic
  const getFilterStatusText = (status) => {
    const statusTexts = {
      'all': 'جميع الحالات',
      'pending': 'قيد الانتظار',
      'accepted': 'مقبول',
      'completed': 'مكتمل',
      'cancelled': 'ملغي',
      'in_progress': 'قيد التنفيذ'
    };
    return statusTexts[status] || status;
  };

  useEffect(() => {
    checkAuthentication();
    if (user) {
      loadClientData();
    }
  }, [user?.id]);

  const checkAuthentication = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/auth');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'client') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/auth');
    }
  };

  const loadClientData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadOrders(),
        loadFavorites(),
        loadInvoices(),
        loadReviews(),
        loadRatings()
      ]);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await apiService.get('/api/orders/');
      console.log('[DEBUG] loadOrders response:', response);
      setOrders(response || []);
      
      // Calculate stats
      const totalOrders = response?.length || 0;
      const completedOrders = response?.filter(order => order.status === 'completed')?.length || 0;
      const pendingOrders = response?.filter(order => order.status === 'pending')?.length || 0;
      const totalSpent = response?.reduce((sum, order) => sum + parseFloat(order.offered_price || 0), 0) || 0;
      
      setStats(prev => ({
        ...prev,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalSpent
      }));
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    }
  };

  const loadFavorites = async () => {
    try {
      // Assuming there's a favorites endpoint
      const response = await apiService.get('/api/favorites/');
      setFavorites(response || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const loadInvoices = async () => {
    try {
      const result = await invoiceService.getMyInvoices();
      if (result.success) {
        setInvoices(result.data || []);
        
        // Update statistics based on invoices
        const totalInvoices = result.data?.length || 0;
        const paidInvoices = result.data?.filter(inv => inv.status === 'paid')?.length || 0;
        const unpaidInvoices = result.data?.filter(inv => inv.status === 'unpaid')?.length || 0;
        const totalAmount = result.data?.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0) || 0;
        
        setStatistics(prev => ({
          ...prev,
          totalInvoices,
          paidInvoices,
          unpaidInvoices,
          totalAmount: totalAmount.toFixed(2)
        }));
      } else {
        console.error('Error loading invoices:', result.error);
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await apiService.get('/api/reviews/my-reviews/');
      setReviews(response || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const loadRatings = async () => {
    try {
      const response = await apiService.get('/api/ratings/my-ratings/');
      setRatings(response || []);
      
      // Calculate average rating
      if (response && response.length > 0) {
        const avgRating = response.reduce((sum, rating) => sum + rating.rating, 0) / response.length;
        setStats(prev => ({ ...prev, avgRating }));
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
      setRatings([]);
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', icon: FaClock, text: 'قيد الانتظار' },
      accepted: { class: 'badge-info', icon: FaCheck, text: 'مقبول' },
      completed: { class: 'badge-success', icon: FaCheck, text: 'مكتمل' },
      cancelled: { class: 'badge-danger', icon: FaExclamationTriangle, text: 'ملغي' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`badge ${config.class}`}>
        <Icon className="me-1" />
        {config.text}
      </span>
    );
  };

  const getInvoiceStatusBadge = (status) => {
    const statusConfig = {
      paid: { class: 'badge-success', text: 'مدفوع' },
      pending: { class: 'badge-warning', text: 'مؤجل' },
      overdue: { class: 'badge-danger', text: 'متأخر' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`badge ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await apiService.delete(`/api/favorites/${favoriteId}/`);
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const downloadInvoice = async (invoiceId) => {
    try {
      const result = await invoiceService.downloadInvoice(invoiceId);
      if (!result.success) {
        console.error('Error downloading invoice:', result.error);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleViewOrder = (order) => {
    console.log('[DEBUG] handleViewOrder called with order:', order);
    console.log('[DEBUG] Setting selectedOrder and showOrderModal to true');
    setSelectedOrder(order);
    setShowOrderModal(true);
    console.log('[DEBUG] Modal state should be updated now');
  };

  const handleEditOrder = (order) => {
    console.log('[DEBUG] handleEditOrder called with order:', order);
    // Navigate to OrderPage with order data for editing
    navigate('/order-page', { 
      state: { 
        editMode: true, 
        orderData: order,
        service: { 
          id: order.service_id || order.service?.id, 
          title: order.service_name || order.service?.title,
          base_price: order.offered_price 
        }
      } 
    });
  };

  const handleOrderMessages = (order) => {
    // Navigate to messages page with specific order conversation
    navigate('/messages', { 
      state: { 
        orderId: order.id,
        conversationWith: order.service?.provider || order.worker
      } 
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar 
        key={index} 
        className={index < rating ? 'text-warning' : 'text-muted'} 
      />
    ));
  };

  const renderOverview = () => (
    <div className="overview-section">
      {/* Hero Welcome Section */}
      <div className="feature-section mb-5">
        <div className="feature-content">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h2 className="fw-bold text-primary mb-3">
                <FaTrophy className="me-2" />
                مرحباً بك، {user?.first_name}!
              </h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                نحن سعداء لرؤيتك مرة أخرى. تابع طلباتك وخدماتك المفضلة من هنا.
              </p>
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/services')}
                  style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
                >
                  <FaPlus className="me-2" />
                  طلب خدمة جديدة
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => setActiveTab('orders')}
                  style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
                >
                  <FaEye className="me-2" />
                  عرض طلباتي
                </button>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <img 
                src={clientHeroImage} 
                alt="مرحباً بك" 
                className="feature-image img-fluid"
                style={{ maxWidth: '400px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-5">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaClipboardList />
            </div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>إجمالي الطلبات</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaCheck />
            </div>
            <div className="stat-content">
              <h3>{stats.completedOrders}</h3>
              <p>طلبات مكتملة</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-content">
              <h3>{stats.totalSpent.toFixed(2)} ج.م</h3>
              <p>إجمالي المبلغ المدفوع</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaReceipt />
            </div>
            <div className="stat-content">
              <h3>{statistics.totalInvoices || 0}</h3>
              <p>إجمالي الفواتير</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaCheck />
            </div>
            <div className="stat-content">
              <h3>{statistics.paidInvoices || 0}</h3>
              <p>الفواتير المدفوعة</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <h3>{statistics.unpaidInvoices || 0}</h3>
              <p>الفواتير غير المدفوعة</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaStar />
            </div>
            <div className="stat-content">
              <h3>{stats.avgRating.toFixed(1)}</h3>
              <p>متوسط التقييم</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="feature-section mb-5">
        <div className="feature-content">
          <h3 className="text-center mb-5 fw-bold">
            لماذا تختار <span className="text-primary">خدماتك؟</span>
          </h3>
          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-4 h-100 rounded-4 shadow-sm bg-white" 
                   style={{ transition: "all 0.3s ease" }}
                   onMouseOver={(e) => {
                     e.currentTarget.style.transform = "scale(1.05)";
                     e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.2)";
                   }}
                   onMouseOut={(e) => {
                     e.currentTarget.style.transform = "scale(1)";
                     e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
                   }}>
                <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
                     style={{ width: "60px", height: "60px", background: "rgba(0,123,255,0.1)" }}>
                  <FaShieldAlt className="text-primary" style={{ fontSize: "1.8rem" }} />
                </div>
                <h5 className="fw-bold mb-2">ضمان جودة شهر كامل</h5>
                <p className="text-muted small mb-0">ضمان جودة الخدمة لمدة شهر كامل.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 h-100 rounded-4 shadow-sm bg-white" 
                   style={{ transition: "all 0.3s ease" }}
                   onMouseOver={(e) => {
                     e.currentTarget.style.transform = "scale(1.05)";
                     e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.2)";
                   }}
                   onMouseOut={(e) => {
                     e.currentTarget.style.transform = "scale(1)";
                     e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
                   }}>
                <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
                     style={{ width: "60px", height: "60px", background: "rgba(0,123,255,0.1)" }}>
                  <FaCalendarAlt className="text-primary" style={{ fontSize: "1.8rem" }} />
                </div>
                <h5 className="fw-bold mb-2">مواعيد مرنة</h5>
                <p className="text-muted small mb-0">مواعيد مرنة والتزام بالوقت.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 h-100 rounded-4 shadow-sm bg-white" 
                   style={{ transition: "all 0.3s ease" }}
                   onMouseOver={(e) => {
                     e.currentTarget.style.transform = "scale(1.05)";
                     e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.2)";
                   }}
                   onMouseOut={(e) => {
                     e.currentTarget.style.transform = "scale(1)";
                     e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
                   }}>
                <div className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
                     style={{ width: "60px", height: "60px", background: "rgba(0,123,255,0.1)" }}>
                  <FaUserFriends className="text-primary" style={{ fontSize: "1.8rem" }} />
                </div>
                <h5 className="fw-bold mb-2">فنيين موثوقين</h5>
                <p className="text-muted small mb-0">فنيين موثوقين وعمال معتمدين.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row">
        <div className="col-md-6">
          <div className="recent-orders-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">الطلبات الأخيرة</h5>
              <FaChartLine className="text-primary" style={{ fontSize: '1.5rem' }} />
            </div>
            {orders.slice(0, 3).map(order => (
              <div key={order.id} className="recent-order-item">
                <div className="order-info">
                  <h6>{order.service_name}</h6>
                  <small className="text-muted">
                    {new Date(order.date_created).toLocaleDateString('ar-EG')}
                  </small>
                </div>
                <div className="order-status">
                  {getOrderStatusBadge(order.status)}
                </div>
              </div>
            ))}
            <button 
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={() => setActiveTab('orders')}
            >
              عرض جميع الطلبات
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="recent-invoices-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">الفواتير الأخيرة</h5>
              <FaFileInvoiceDollar className="text-success" style={{ fontSize: '1.5rem' }} />
            </div>
            {invoices.slice(0, 3).map(invoice => (
              <div key={invoice.id} className="recent-invoice-item">
                <div className="invoice-info">
                  <h6>فاتورة #{invoice.id}</h6>
                  <small className="text-muted">
                    {invoice.amount} ج.م
                  </small>
                </div>
                <div className="invoice-status">
                  {getInvoiceStatusBadge(invoice.status)}
                </div>
              </div>
            ))}
            <button 
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={() => setActiveTab('invoices')}
            >
              عرض جميع الفواتير
            </button>
          </div>
        </div>
      </div>

      {/* Achievement Section */}
      <div className="feature-section mt-5">
        <div className="feature-content">
          <div className="row align-items-center">
            <div className="col-md-6 text-center">
              <img 
                src={achievementImage} 
                alt="إنجازاتك" 
                className="feature-image img-fluid"
                style={{ maxWidth: '300px', width: '100%' }}
              />
            </div>
            <div className="col-md-6">
              <h3 className="fw-bold text-warning mb-3">
                <FaTrophy className="me-2" />
                إنجازاتك معنا
              </h3>
              <div className="achievement-stats">
                <div className="d-flex align-items-center mb-3">
                  <div className="achievement-icon me-3">
                    <FaGift className="text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <h6 className="mb-1">عضو مميز</h6>
                    <p className="text-muted mb-0">أكثر من {stats.totalOrders} طلبات مكتملة</p>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div className="achievement-icon me-3">
                    <FaStar className="text-warning" style={{ fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <h6 className="mb-1">تقييم ممتاز</h6>
                    <p className="text-muted mb-0">متوسط تقييم {stats.avgRating.toFixed(1)} نجوم</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <div className="achievement-icon me-3">
                    <FaHeart className="text-danger" style={{ fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <h6 className="mb-1">عميل وفي</h6>
                    <p className="text-muted mb-0">معنا منذ انضمامك للمنصة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="orders-section">
      {/* Orders Header Section */}
      <div className="feature-section mb-4">
        <div className="feature-content">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3 className="fw-bold text-primary mb-2">
                <FaClipboardList className="me-2" />
                إدارة طلباتي
              </h3>
              <p className="text-muted mb-0">تتبع جميع طلباتك وحالتها من مكان واحد</p>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/services')}
                style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
              >
                <FaPlus className="me-2" />
                طلب جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h5>جميع الطلبات ({getFilteredOrders().length})</h5>
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={orderFilter}
            onChange={handleOrderFilterChange}
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="accepted">مقبول</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
            <option value="in_progress">قيد التنفيذ</option>
          </select>
        </div>
      </div>
      
      <div className="orders-list">
        {getFilteredOrders().map(order => {
          console.log('[DEBUG] Rendering order:', order.id, 'Status:', order.status, 'Data:', order);
          return (
            <div key={order.id} className="order-card">
            <div className="order-header">
              <h6>{order.service_name}</h6>
              {getOrderStatusBadge(order.status)}
            </div>
            <div className="order-body">
              <p className="order-description">{order.description}</p>
              <div className="order-details">
                <span><strong>السعر المعروض:</strong> {order.offered_price} ج.م</span>
                <span><strong>تاريخ الطلب:</strong> {new Date(order.date_created).toLocaleDateString('ar-EG')}</span>
                {order.scheduled_time && (
                  <span><strong>موعد الخدمة:</strong> {new Date(order.scheduled_time).toLocaleDateString('ar-EG')}</span>
                )}
              </div>
            </div>
            <div className="order-actions" style={{ 
              display: 'flex', 
              gap: '8px', 
              justifyContent: 'flex-end',
              marginTop: '15px',
              borderTop: '1px solid #e9ecef',
              paddingTop: '15px'
            }}>
              <button 
                className="btn btn-sm btn-primary"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[DEBUG] View button clicked for order:', order.id);
                  handleViewOrder(order);
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(0,123,255,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
                style={{
                  minWidth: '80px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <FaEye className="me-1" />
                عرض
              </button>
              {(order.status === 'pending' || order.status === 'cancelled') && (
                <button 
                  className="btn btn-sm btn-warning"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[DEBUG] Edit button clicked for order:', order.id, 'Status:', order.status);
                    handleEditOrder(order);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(255,193,7,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                  style={{
                    minWidth: '80px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: 'white',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <FaEdit className="me-1" />
                  تعديل
                </button>
              )}
              {order.status !== 'cancelled' && ['accepted', 'completed', 'in_progress'].includes(order.status) && (
                <button 
                  className="btn btn-sm btn-success"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[DEBUG] Messages button clicked for order:', order.id);
                    handleOrderMessages(order);
                  }}
                  style={{
                    minWidth: '80px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px'
                  }}
                >
                  <FaComments className="me-1" />
                  رسائل
                </button>
              )}
            </div>
            </div>
          );
        })}
        
        {getFilteredOrders().length === 0 && (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <FaClipboardList size={48} className="text-muted" />
            </div>
            <h6 className="text-muted">
              {orderFilter === 'all' ? 'لا توجد طلبات بعد' : `لا توجد طلبات بحالة "${getFilterStatusText(orderFilter)}"`}
            </h6>
            <p className="text-muted small">
              {orderFilter === 'all' 
                ? 'ابدأ بطلب خدمة جديدة من الصفحة الرئيسية' 
                : 'جرب تغيير الفلتر لعرض طلبات أخرى'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderFavorites = () => (
    <div className="favorites-section">
      <div className="section-header">
        <h5>الخدمات المفضلة</h5>
      </div>
      
      <div className="favorites-grid">
        {favorites.map(favorite => (
          <div key={favorite.id} className="favorite-card">
            <div className="favorite-header">
              <h6>{favorite.service_name}</h6>
              <button 
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeFavorite(favorite.id)}
              >
                <FaTrash />
              </button>
            </div>
            <div className="favorite-body">
              <p>{favorite.service_description}</p>
              <div className="favorite-price">
                <strong>{favorite.service_price} ج.م</strong>
              </div>
            </div>
            <div className="favorite-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/service/${favorite.service_id}`)}
              >
                عرض الخدمة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="invoices-section">
      <div className="section-header">
        <h5>فواتيري</h5>
      </div>
      
      <div className="invoices-table">
        <table className="table">
          <thead>
            <tr>
              <th>رقم الفاتورة</th>
              <th>الطلب</th>
              <th>المبلغ</th>
              <th>الحالة</th>
              <th>تاريخ الاستحقاق</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>#{invoice.id}</td>
                <td>{invoice.order_title}</td>
                <td>{invoice.amount} ج.م</td>
                <td>{getInvoiceStatusBadge(invoice.status)}</td>
                <td>{new Date(invoice.due_date).toLocaleDateString('ar-EG')}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => navigate(`/invoice/${invoice.id}`)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-success"
                    onClick={() => downloadInvoice(invoice.id)}
                  >
                    <FaDownload />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div className="reviews-section">
      <div className="section-header">
        <h5>تقييماتي</h5>
      </div>
      
      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <h6>{review.service_name}</h6>
              <div className="review-rating">
                {renderStars(review.rating)}
              </div>
            </div>
            <div className="review-body">
              <p>{review.comment}</p>
              <small className="text-muted">
                {new Date(review.created_at).toLocaleDateString('ar-EG')}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="home-client" dir="rtl">
      <Navbar />
      
      <div className="client-dashboard">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-3">
              <div className="sidebar-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <FaUser />
                  </div>
                  <div className="profile-info">
                    <h5>{user?.first_name} {user?.last_name}</h5>
                    <p className="text-muted">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="profile-nav">
                  <button 
                    className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <FaUser className="nav-icon" />
                    نظرة عامة
                  </button>
                  <button 
                    className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <FaClipboardList className="nav-icon" />
                    طلباتي ({orders.length})
                  </button>
                  <button 
                    className={`nav-item ${activeTab === 'favorites' ? 'active' : ''}`}
                    onClick={() => setActiveTab('favorites')}
                  >
                    <FaHeart className="nav-icon" />
                    المفضلة ({favorites.length})
                  </button>
                  <button 
                    className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
                    onClick={() => setActiveTab('invoices')}
                  >
                    <FaFileInvoiceDollar className="nav-icon" />
                    الفواتير ({invoices.length})
                  </button>
                  <button 
                    className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    <FaStar className="nav-icon" />
                    التقييمات ({reviews.length})
                  </button>
                </nav>
              </div>
            </div>
            
            <div className="col-md-9">
      <div className="main-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'favorites' && renderFavorites()}
                {activeTab === 'invoices' && renderInvoices()}
                {activeTab === 'reviews' && renderReviews()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FaClipboardList className="me-2" />
                  تفاصيل الطلب #{selectedOrder.id}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowOrderModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Order Status Banner */}
                <div className="order-status-banner mb-4 p-3 rounded" 
                     style={{
                       background: selectedOrder.status === 'completed' ? '#d4edda' :
                                 selectedOrder.status === 'cancelled' ? '#f8d7da' :
                                 selectedOrder.status === 'accepted' ? '#cce7ff' : '#fff3cd',
                       border: `1px solid ${
                         selectedOrder.status === 'completed' ? '#c3e6cb' :
                         selectedOrder.status === 'cancelled' ? '#f5c6cb' :
                         selectedOrder.status === 'accepted' ? '#a6d4ff' : '#ffeaa7'
                       }`
                     }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">حالة الطلب: {getOrderStatusBadge(selectedOrder.status)}</h6>
                      <small className="text-muted">آخر تحديث: {new Date(selectedOrder.date_created).toLocaleString('ar-EG')}</small>
                    </div>
                    <div className="text-end">
                      <div className="h5 mb-0 text-primary">{selectedOrder.offered_price} ج.م</div>
                      <small className="text-muted">السعر المعروض</small>
                    </div>
                  </div>
                </div>

                {/* Service Information */}
                <div className="service-info-section mb-4">
                  <h6 className="section-title mb-3">
                    <FaClipboardList className="me-2 text-primary" />
                    معلومات الخدمة
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="order-detail-item">
                        <strong>اسم الخدمة:</strong>
                        <span>{selectedOrder.service_name}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="order-detail-item">
                        <strong>فئة الخدمة:</strong>
                        <span>{selectedOrder.service_category || 'غير محدد'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="order-details-section mb-4">
                  <h6 className="section-title mb-3">
                    <FaCalendarAlt className="me-2 text-primary" />
                    تفاصيل الطلب
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="order-detail-item">
                        <strong>تاريخ الطلب:</strong>
                        <span>{new Date(selectedOrder.date_created).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                    {selectedOrder.scheduled_time && (
                      <div className="col-md-6">
                        <div className="order-detail-item">
                          <strong>موعد الخدمة:</strong>
                          <span>{new Date(selectedOrder.scheduled_time).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    )}
                    {selectedOrder.delivery_time && (
                      <div className="col-md-6">
                        <div className="order-detail-item">
                          <strong>موعد التسليم المتوقع:</strong>
                          <span>{new Date(selectedOrder.delivery_time).toLocaleString('ar-EG')}</span>
                        </div>
                      </div>
                    )}
                    <div className="col-md-6">
                      <div className="order-detail-item">
                        <strong>رقم الطلب:</strong>
                        <span>#{selectedOrder.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="description-section mb-4">
                  <h6 className="section-title mb-3">
                    <FaEdit className="me-2 text-primary" />
                    وصف الطلب
                  </h6>
                  <div className="order-detail-item">
                    <p className="mb-0" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                      {selectedOrder.description || 'لا يوجد وصف متاح'}
                    </p>
                  </div>
                </div>

                {/* Location Information */}
                {selectedOrder.location_lat && selectedOrder.location_lng && (
                  <div className="location-section mb-4">
                    <h6 className="section-title mb-3">
                      <FaMapMarkerAlt className="me-2 text-primary" />
                      معلومات الموقع
                    </h6>
                    <div className="order-detail-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p className="mb-1">
                            <strong>خط العرض:</strong> {selectedOrder.location_lat}
                          </p>
                          <p className="mb-0">
                            <strong>خط الطول:</strong> {selectedOrder.location_lng}
                          </p>
                        </div>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => window.open(`https://maps.google.com/?q=${selectedOrder.location_lat},${selectedOrder.location_lng}`, '_blank')}
                        >
                          <FaMapMarkerAlt className="me-1" />
                          عرض على الخريطة
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Timeline */}
                <div className="timeline-section">
                  <h6 className="section-title mb-3">
                    <FaClock className="me-2 text-primary" />
                    مراحل الطلب
                  </h6>
                  <div className="order-timeline">
                    <div className={`timeline-item ${selectedOrder.status !== 'cancelled' ? 'completed' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h6>تم إنشاء الطلب</h6>
                        <small>{new Date(selectedOrder.date_created).toLocaleString('ar-EG')}</small>
                      </div>
                    </div>
                    <div className={`timeline-item ${['accepted', 'completed'].includes(selectedOrder.status) ? 'completed' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h6>تم قبول الطلب</h6>
                        <small>{selectedOrder.status === 'accepted' || selectedOrder.status === 'completed' ? 'تم' : 'في الانتظار'}</small>
                      </div>
                    </div>
                    <div className={`timeline-item ${selectedOrder.status === 'completed' ? 'completed' : ''}`}>
                      <div className="timeline-marker"></div>
                      <div className="timeline-content">
                        <h6>تم إكمال الخدمة</h6>
                        <small>{selectedOrder.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowOrderModal(false)}
                >
                  إغلاق
                </button>
                {selectedOrder.status === 'pending' && (
                  <button 
                    type="button" 
                    className="btn btn-warning"
                    onClick={() => {
                      setShowOrderModal(false);
                      handleEditOrder(selectedOrder);
                    }}
                  >
                    <FaEdit className="me-1" />
                    تعديل الطلب
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && ['accepted', 'completed', 'in_progress'].includes(selectedOrder.status) && (
                  <button 
                    type="button" 
                    className="btn btn-success"
                    onClick={() => {
                      setShowOrderModal(false);
                      handleOrderMessages(selectedOrder);
                    }}
                  >
                    <FaComments className="me-1" />
                    المراسلة
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeClient;
