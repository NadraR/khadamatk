import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaClipboardList, 
  FaTools, 
  FaFileInvoiceDollar, 
  FaStar, 
  FaComments,
  FaPlus,
  FaEye,
  FaEdit,
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
  FaMapMarkerAlt,
  FaCog,
  FaMoneyBillWave,
  FaHandshake,
  FaBell
} from 'react-icons/fa';
import apiService from '../services/ApiService';
import invoiceService from '../services/InvoiceService';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';
import './HomeClient.css'; // Reusing the same CSS file for consistent styling

// Import images (using SVG data URIs for consistency)
const providerHeroImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23f0f8ff"/><circle cx="200" cy="150" r="80" fill="%234da6ff" opacity="0.3"/><circle cx="600" cy="400" r="120" fill="%230077ff" opacity="0.2"/><rect x="100" y="200" width="600" height="200" rx="20" fill="%23ffffff" opacity="0.9"/><text x="400" y="320" text-anchor="middle" fill="%230077ff" font-size="32" font-weight="bold">لوحة تحكم مزود الخدمة</text></svg>';

const serviceImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23e8f5e8"/><circle cx="100" cy="100" r="40" fill="%2310b981" opacity="0.6"/><circle cx="300" cy="200" r="60" fill="%234da6ff" opacity="0.4"/><rect x="50" y="120" width="300" height="120" rx="15" fill="%23ffffff"/><text x="200" y="190" text-anchor="middle" fill="%2310b981" font-size="18" font-weight="bold">خدماتك</text></svg>';

const achievementImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fff3cd"/><polygon points="200,50 220,120 290,120 235,165 255,235 200,190 145,235 165,165 110,120 180,120" fill="%23f59e0b"/><text x="200" y="280" text-anchor="middle" fill="%23856404" font-size="16" font-weight="bold">إنجازاتك</text></svg>';

const HomeProvider = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalEarned: 0,
    avgRating: 0,
    totalServices: 0,
    activeServices: 0
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
  }, []);

  useEffect(() => {
    if (user) {
      loadProviderData();
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
      if (parsedUser.role !== 'worker') {
        navigate('/');
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/auth');
    }
  };

  const loadProviderData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadWorkerProfile(),
        loadProviderOrders(),
        loadServices(),
        loadInvoices(),
        loadReviews()
      ]);
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkerProfile = async () => {
    try {
      const response = await apiService.get('/api/accounts/worker/profile/');
      console.log('[DEBUG] Worker profile response:', response);
      const workerProfile = response.worker_profile || response;
      setProfile(workerProfile);
      
      // Update user data with profile info
      if (workerProfile && user) {
        setUser(prev => ({
          ...prev,
          job_title: workerProfile.job_title,
          skills: workerProfile.skills,
          experience_years: workerProfile.experience_years,
          hourly_rate: workerProfile.hourly_rate,
          neighborhood: workerProfile.neighborhood
        }));
      }
    } catch (error) {
      console.error('Error loading worker profile:', error);
      // If profile doesn't exist, user might need to complete it
      if (error.response?.status === 404) {
        console.log('[DEBUG] Worker profile not found, user may need to complete profile');
      }
    }
  };

  const loadProviderOrders = async () => {
    try {
      // For workers, we need to get orders where they are the service provider
      const response = await apiService.get('/api/orders/');
      console.log('[DEBUG] Provider orders response:', response);
      
      // Extract orders array from response
      const ordersData = response?.results || response?.data || response || [];
      
      // Filter orders where this worker is the provider (this logic might need adjustment based on your Order model)
      const providerOrders = Array.isArray(ordersData) ? ordersData.filter(order => 
        order.worker_id === user.id || 
        order.service?.provider?.id === user.id ||
        order.service?.user_id === user.id
      ) : [];
      
      setOrders(providerOrders);
      
      // Calculate stats
      const totalOrders = providerOrders.length;
      const completedOrders = providerOrders.filter(order => order.status === 'completed').length;
      const pendingOrders = providerOrders.filter(order => order.status === 'pending').length;
      const totalEarned = providerOrders
        .filter(order => order.status === 'completed')
        .reduce((sum, order) => sum + parseFloat(order.offered_price || 0), 0);
      
      setStats(prev => ({
        ...prev,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalEarned
      }));
    } catch (error) {
      console.error('Error loading provider orders:', error);
      setOrders([]);
    }
  };

  const loadServices = async () => {
    try {
      // Load only services created by this worker
      const response = await apiService.get(`/api/services/?provider=${user.id}`);
      console.log('[DEBUG] Worker services response:', response);
      
      const servicesData = response?.results || response?.data || response || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
      
      const totalServices = Array.isArray(servicesData) ? servicesData.length : 0;
      const activeServices = Array.isArray(servicesData) ? servicesData.filter(service => service.is_active !== false).length : 0;
      
      setStats(prev => ({
        ...prev,
        totalServices,
        activeServices
      }));
    } catch (error) {
      console.error('Error loading worker services:', error);
      setServices([]);
    }
  };

  const loadInvoices = async () => {
    try {
      const result = await invoiceService.getMyInvoices();
      if (result.success) {
        // Filter invoices for this provider
        const providerInvoices = result.data?.filter(invoice => 
          invoice.provider_id === user.id || invoice.worker_id === user.id
        ) || [];
        
        setInvoices(providerInvoices);
        
        // Update statistics based on invoices
        const totalInvoices = providerInvoices.length;
        const paidInvoices = providerInvoices.filter(inv => inv.status === 'paid').length;
        const unpaidInvoices = providerInvoices.filter(inv => inv.status === 'unpaid').length;
        const totalAmount = providerInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
        
        setStatistics({
          totalInvoices,
          paidInvoices,
          unpaidInvoices,
          totalAmount: totalAmount.toFixed(2)
        });
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
      // Load reviews for this provider's services
      const response = await apiService.get('/api/reviews/my-reviews/');
      const reviewsData = response?.results || response?.data || response || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      
      // Calculate average rating
      if (Array.isArray(reviewsData) && reviewsData.length > 0) {
        const avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length;
        setStats(prev => ({ ...prev, avgRating }));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', icon: FaClock, text: 'قيد الانتظار' },
      accepted: { class: 'badge-info', icon: FaCheck, text: 'مقبول' },
      completed: { class: 'badge-success', icon: FaCheck, text: 'مكتمل' },
      cancelled: { class: 'badge-danger', icon: FaExclamationTriangle, text: 'ملغي' },
      in_progress: { class: 'badge-primary', icon: FaClock, text: 'قيد التنفيذ' }
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

  const handleViewOrder = (order) => {
    console.log('[DEBUG] handleViewOrder called with order:', order);
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleOrderMessages = (order) => {
    // Navigate to messages page with specific order conversation
    navigate('/messages', { 
      state: { 
        orderId: order.id,
        conversationWith: order.customer || order.client
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
                مرحباً بك، {user?.first_name || user?.name}!
              </h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                {profile?.job_title && <><strong>المهنة:</strong> {profile.job_title}<br /></>}
                {profile?.experience_years && <><strong>سنوات الخبرة:</strong> {profile.experience_years} سنة<br /></>}
                {profile?.neighborhood && <><strong>المنطقة:</strong> {profile.neighborhood}<br /></>}
                إدارة خدماتك وطلباتك من مكان واحد.
              </p>
              <div className="d-flex gap-3">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => setActiveTab('services')}
                  style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
                >
                  <FaPlus className="me-2" />
                  إدارة الخدمات
                </button>
                <button 
                  className="btn btn-outline-primary btn-lg"
                  onClick={() => navigate('/notifications')}
                  style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
                >
                  <FaBell className="me-2" />
                  عرض الإشعارات
                </button>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <img 
                src={providerHeroImage} 
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
              <FaMoneyBillWave />
            </div>
            <div className="stat-content">
              <h3>{stats.totalEarned.toFixed(2)} ج.م</h3>
              <p>إجمالي الأرباح</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaTools />
            </div>
            <div className="stat-content">
              <h3>{stats.totalServices}</h3>
              <p>إجمالي الخدمات</p>
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
              <FaStar />
            </div>
            <div className="stat-content">
              <h3>{stats.avgRating.toFixed(1)}</h3>
              <p>متوسط التقييم</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>{stats.pendingOrders}</h3>
              <p>طلبات في الانتظار</p>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Features Section */}
      <div className="feature-section mb-5">
        <div className="feature-content">
          <h3 className="text-center mb-5 fw-bold">
            مميزات <span className="text-primary">مزود الخدمة</span>
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
                  <FaHandshake className="text-primary" style={{ fontSize: "1.8rem" }} />
                </div>
                <h5 className="fw-bold mb-2">عملاء موثوقين</h5>
                <p className="text-muted small mb-0">تواصل مع عملاء موثوقين ومعتمدين.</p>
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
                  <FaMoneyBillWave className="text-primary" style={{ fontSize: "1.8rem" }} />
                </div>
                <h5 className="fw-bold mb-2">دفعات آمنة</h5>
                <p className="text-muted small mb-0">نظام دفع آمن ومضمون للجميع.</p>
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
                  <FaBell className="text-primary" style={{ fontSize: "1.8rem" }} />
                </div>
                <h5 className="fw-bold mb-2">إشعارات فورية</h5>
                <p className="text-muted small mb-0">تنبيهات فورية للطلبات الجديدة.</p>
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
              onClick={() => navigate('/notifications')}
            >
              عرض جميع الإشعارات
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
                إنجازاتك كمزود خدمة
              </h3>
              <div className="achievement-stats">
                <div className="d-flex align-items-center mb-3">
                  <div className="achievement-icon me-3">
                    <FaGift className="text-success" style={{ fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <h6 className="mb-1">مزود خدمة مميز</h6>
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
                    <FaMoneyBillWave className="text-primary" style={{ fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <h6 className="mb-1">أرباح مستقرة</h6>
                    <p className="text-muted mb-0">إجمالي {stats.totalEarned.toFixed(2)} ج.م</p>
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
              <p className="text-muted mb-0">تتبع جميع طلبات العملاء وحالتها من مكان واحد</p>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-success btn-lg"
                onClick={() => navigate('/notifications')}
                style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
              >
                <FaBell className="me-2" />
                الإشعارات
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
        {getFilteredOrders().map(order => (
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
                onClick={() => handleViewOrder(order)}
                style={{
                  minWidth: '80px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px'
                }}
              >
                <FaEye className="me-1" />
                عرض
              </button>
              {order.status === 'pending' && (
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => {
                    // Handle accepting order
                    console.log('[DEBUG] Accept order:', order.id);
                  }}
                  style={{
                    minWidth: '80px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px'
                  }}
                >
                  <FaCheck className="me-1" />
                  قبول
                </button>
              )}
              {['accepted', 'completed', 'in_progress'].includes(order.status) && (
                <button 
                  className="btn btn-sm btn-info"
                  onClick={() => handleOrderMessages(order)}
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
        ))}
        
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
                ? 'انتظر طلبات جديدة من العملاء' 
                : 'جرب تغيير الفلتر لعرض طلبات أخرى'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="services-section">
      <div className="feature-section mb-4">
        <div className="feature-content">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h3 className="fw-bold text-success mb-2">
                <FaTools className="me-2" />
                إدارة خدماتي
              </h3>
              <p className="text-muted mb-0">أضف وأدر خدماتك المختلفة</p>
            </div>
            <div className="col-md-4 text-end">
              <button 
                className="btn btn-success btn-lg"
                onClick={() => navigate('/services/create')}
                style={{ borderRadius: '50px', padding: '0.75rem 2rem' }}
              >
                <FaPlus className="me-2" />
                خدمة جديدة
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card">
            <div className="service-header">
              <h6>{service.title}</h6>
              <span className={`badge ${service.is_active ? 'badge-success' : 'badge-secondary'}`}>
                {service.is_active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
            <div className="service-body">
              <p>{service.description}</p>
              <div className="service-price">
                <strong>{service.base_price} ج.م</strong>
              </div>
            </div>
            <div className="service-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/service/${service.id}`)}
              >
                <FaEye className="me-1" />
                عرض
              </button>
              <button 
                className="btn btn-warning btn-sm"
                onClick={() => navigate(`/service/${service.id}/edit`)}
              >
                <FaEdit className="me-1" />
                تعديل
              </button>
            </div>
          </div>
        ))}
        
        {services.length === 0 && (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <FaTools size={48} className="text-muted" />
            </div>
            <h6 className="text-muted">لا توجد خدمات بعد</h6>
            <p className="text-muted small">ابدأ بإضافة خدمتك الأولى</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/services/create')}
            >
              <FaPlus className="me-2" />
              إضافة خدمة جديدة
            </button>
          </div>
        )}
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
        <h5>تقييمات عملائي</h5>
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
                بواسطة: {review.client_name} • {new Date(review.created_at).toLocaleDateString('ar-EG')}
              </small>
            </div>
          </div>
        ))}
        
        {reviews.length === 0 && (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <FaStar size={48} className="text-muted" />
            </div>
            <h6 className="text-muted">لا توجد تقييمات بعد</h6>
            <p className="text-muted small">ستظهر هنا تقييمات العملاء لخدماتك</p>
          </div>
        )}
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
                    <h5>{user?.first_name || user?.name} {user?.last_name}</h5>
                    <p className="text-muted">{user?.email}</p>
                    {profile?.job_title && (
                      <small className="text-primary fw-bold">{profile.job_title}</small>
                    )}
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
                    onClick={() => navigate('/notifications')}
                  >
                    <FaBell className="nav-icon" />
                    الإشعارات
                  </button>
                  <button 
                    className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveTab('services')}
                  >
                    <FaTools className="nav-icon" />
                    خدماتي ({services.length})
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
                {activeTab === 'services' && renderServices()}
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
                        <strong>العميل:</strong>
                        <span>{selectedOrder.customer_name || 'غير محدد'}</span>
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
                    className="btn btn-success"
                    onClick={() => {
                      setShowOrderModal(false);
                      // Handle accepting order
                      console.log('[DEBUG] Accept order from modal:', selectedOrder.id);
                    }}
                  >
                    <FaCheck className="me-1" />
                    قبول الطلب
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && ['accepted', 'completed', 'in_progress'].includes(selectedOrder.status) && (
                  <button 
                    type="button" 
                    className="btn btn-info"
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

export default HomeProvider;