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
  FaMoneyBillWave,
  FaHandshake,
  FaBell
} from 'react-icons/fa';
import apiService from '../services/ApiService';
import ReviewService from '../services/ReviewService';
import RatingService from '../services/RatingService';
import RatingStars from '../components/RatingStars';
import ReviewCard from '../components/ReviewCard';
import Navbar from '../components/Navbar';
import './HomeClient.css'; // Reusing the same CSS file for consistent styling

// Import images (using SVG data URIs for consistency)
const providerHeroImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23f0f8ff"/><circle cx="200" cy="150" r="80" fill="%234da6ff" opacity="0.3"/><circle cx="600" cy="400" r="120" fill="%230077ff" opacity="0.2"/><rect x="100" y="200" width="600" height="200" rx="20" fill="%23ffffff" opacity="0.9"/><text x="400" y="320" text-anchor="middle" fill="%230077ff" font-size="32" font-weight="bold">لوحة تحكم مزود الخدمة</text></svg>';


const achievementImage = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23fff3cd"/><polygon points="200,50 220,120 290,120 235,165 255,235 200,190 145,235 165,165 110,120 180,120" fill="%23f59e0b"/><text x="200" y="280" text-anchor="middle" fill="%23856404" font-size="16" font-weight="bold">إنجازاتك</text></svg>';

const HomeProvider = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState({
    total_earnings: 0,
    total_platform_fees: 0,
    total_gross_amount: 0,
    total_invoices: 0
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalEarned: 0,
    avgRating: 0,
    totalServices: 0,
    activeServices: 0,
    totalReviews: 0
  });
  
  

  useEffect(() => {
    checkAuthentication();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      loadProviderData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        loadReviews(),
        loadEarnings()
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
      
      // Filter orders where this worker is the provider
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


  const loadReviews = async () => {
    try {
      // Load reviews for this provider using the new ReviewService
      const result = await ReviewService.getProviderReviews(user.id);
      if (result.success) {
        setReviews(result.data);
        
        // Calculate average rating
        if (result.data.length > 0) {
          const avgRating = result.data.reduce((sum, review) => sum + review.rating, 0) / result.data.length;
          setStats(prev => ({ ...prev, avgRating }));
        }
      } else {
        console.error('Error loading reviews:', result.error);
        setReviews([]);
      }
      
      // Also get rating statistics
      const ratingResult = await RatingService.getProviderRating(user.id);
      if (ratingResult.success) {
        setStats(prev => ({ 
          ...prev, 
          avgRating: ratingResult.data.average_rating,
          totalReviews: ratingResult.data.total_ratings 
        }));
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    }
  };

  const loadEarnings = async () => {
    try {
      // Load earnings summary
      const summaryResponse = await apiService.get('/api/invoices/worker/earnings/summary/');
      if (summaryResponse) {
        setEarningsSummary(summaryResponse);
        
        // Update stats with earnings data
        setStats(prev => ({
          ...prev,
          totalEarned: parseFloat(summaryResponse.total_earnings || 0)
        }));
      }
      
      // Load detailed earnings
      const earningsResponse = await apiService.get('/api/invoices/worker/earnings/');
      if (earningsResponse) {
        setEarnings(earningsResponse);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
      setEarnings([]);
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
              <p>صافي الأرباح (بعد خصم 5%)</p>
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
          <div className="recent-earnings-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">الأرباح الأخيرة</h5>
              <FaMoneyBillWave className="text-success" style={{ fontSize: '1.5rem' }} />
            </div>
            {earnings.slice(0, 3).map(earning => (
              <div key={earning.id} className="recent-earning-item">
                <div className="earning-info">
                  <h6>أرباح من فاتورة #{earning.invoice_id}</h6>
                  <small className="text-muted">
                    إجمالي: {earning.gross_amount} ج.م - رسوم منصة (5%): {earning.platform_fee} ج.م
                  </small>
                </div>
                <div className="earning-amount">
                  <span className="text-success fw-bold">
                    صافي الأرباح: {earning.net_earnings} ج.م
                  </span>
                </div>
              </div>
            ))}
            <button 
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={() => setActiveTab('earnings')}
            >
              عرض جميع الأرباح
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
                    <p className="text-muted mb-0">صافي الأرباح {stats.totalEarned.toFixed(2)} ج.م (بعد خصم 5%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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


  const renderReviews = () => (
    <div className="reviews-section">
      <div className="section-header">
        <h5>تقييمات عملائي</h5>
      </div>
      
      {/* Rating Summary */}
      {stats.totalReviews > 0 && (
        <div className="rating-summary mb-4">
          <div className="row">
            <div className="col-md-4">
              <div className="rating-overview text-center p-4 rounded bg-light">
                <div className="rating-score mb-2">
                  <span className="h2 text-primary">{stats.avgRating?.toFixed(1) || '0.0'}</span>
                  <span className="text-muted">/5</span>
                </div>
                <RatingStars rating={stats.avgRating || 0} size="large" readOnly={true} />
                <p className="text-muted mt-2">
                  {stats.totalReviews} تقييم من العملاء
                </p>
              </div>
            </div>
            <div className="col-md-8">
              <div className="rating-stats">
                <h6 className="mb-3">توزيع التقييمات</h6>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => Math.floor(r.rating) === star).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="rating-bar mb-2">
                      <div className="d-flex align-items-center">
                        <span className="rating-label me-2">{star} نجوم</span>
                        <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                          <div 
                            className="progress-bar bg-warning" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="rating-count text-muted small">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="reviews-list">
        {reviews.map(review => (
          <ReviewCard 
            key={review.id} 
            review={review} 
            showService={true}
            className="mb-3"
          />
        ))}
        
        {reviews.length === 0 && (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <FaStar size={48} className="text-muted" />
            </div>
            <h6 className="text-muted">لا توجد تقييمات بعد</h6>
            <p className="text-muted small">ستظهر هنا تقييمات العملاء لخدماتك</p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/services')}
            >
              <FaPlus className="me-2" />
              ابدأ بإضافة خدماتك
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderEarnings = () => (
    <div className="earnings-section">
      <div className="section-header">
        <h5>أرباحي (بعد خصم رسوم المنصة 5%)</h5>
      </div>
      
      {/* Earnings Summary */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-content">
              <h3>{earningsSummary.total_earnings?.toFixed(2) || '0.00'}</h3>
              <p>صافي الأرباح (ج.م)</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaReceipt />
            </div>
            <div className="stat-content">
              <h3>{earningsSummary.total_platform_fees?.toFixed(2) || '0.00'}</h3>
              <p>رسوم المنصة (ج.م)</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <h3>{earningsSummary.total_gross_amount?.toFixed(2) || '0.00'}</h3>
              <p>إجمالي المبلغ (ج.م)</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="stat-card">
            <div className="stat-icon">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-content">
              <h3>{earningsSummary.total_invoices || 0}</h3>
              <p>عدد الفواتير</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="earnings-table">
        <table className="table">
          <thead>
            <tr>
              <th>الفاتورة</th>
              <th>الخدمة</th>
              <th>العميل</th>
              <th>المبلغ الإجمالي</th>
              <th>رسوم المنصة (5%)</th>
              <th>صافي الأرباح</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map(earning => (
              <tr key={earning.id}>
                <td>#{earning.invoice_id}</td>
                <td>{earning.service_name}</td>
                <td>{earning.customer_name}</td>
                <td>{earning.gross_amount} ج.م</td>
                <td className="text-danger">-{earning.platform_fee} ج.م</td>
                <td className="text-success fw-bold">{earning.net_earnings} ج.م</td>
                <td>{new Date(earning.created_at).toLocaleDateString('ar-EG')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {earnings.length === 0 && (
          <div className="empty-state text-center py-5">
            <div className="empty-icon mb-3">
              <FaMoneyBillWave size={48} className="text-muted" />
            </div>
            <h6 className="text-muted">لا توجد أرباح بعد</h6>
            <p className="text-muted small">ستظهر هنا أرباحك من الفواتير المدفوعة</p>
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
                    className={`nav-item ${activeTab === 'services' ? 'active' : ''}`}
                    onClick={() => setActiveTab('services')}
                  >
                    <FaTools className="nav-icon" />
                    خدماتي ({services.length})
                  </button>
                  <button 
                    className={`nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                  >
                    <FaStar className="nav-icon" />
                    التقييمات ({reviews.length})
                  </button>
                  <button 
                    className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('earnings')}
                  >
                    <FaMoneyBillWave className="nav-icon" />
                    الأرباح الصافية ({earnings.length})
                  </button>
                </nav>
              </div>
            </div>
            
            <div className="col-md-9">
              <div className="main-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'services' && renderServices()}
                {activeTab === 'reviews' && renderReviews()}
                {activeTab === 'earnings' && renderEarnings()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeProvider;

