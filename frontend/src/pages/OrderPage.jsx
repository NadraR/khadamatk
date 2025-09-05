import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiService from "../services/ApiService";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

const OrderPage = () => {
  console.log('[DEBUG] OrderPage: Component rendering started');
  
  const injected = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get service data from localStorage or location.state
  const getServiceData = () => {
    const storedService = localStorage.getItem('selectedService');
    if (storedService) {
      try {
        return JSON.parse(storedService);
      } catch (error) {
        console.error('Error parsing stored service:', error);
        return null;
      }
    }
    return location.state?.service || null;
  };

  const service = getServiceData();
  console.log('[DEBUG] OrderPage: Service data:', service);

  const [formData, setFormData] = useState({
    description: "",
    offered_price: "",
    location_lat: null,
    location_lng: null,
    scheduled_time: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      
      console.log('[DEBUG] OrderPage: Checking authentication - token:', accessToken ? 'FOUND' : 'NOT FOUND', 'userData:', userData ? 'FOUND' : 'NOT FOUND');
      
      if (accessToken && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          // Validate user data structure
          if (parsedUser && parsedUser.id && parsedUser.role) {
            console.log('[DEBUG] OrderPage: User authenticated:', parsedUser.id, parsedUser.role);
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            console.log('[DEBUG] OrderPage: Invalid user data structure');
            clearAuthData();
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('[DEBUG] OrderPage: Error parsing user data:', error);
          clearAuthData();
          setIsAuthenticated(false);
        }
      } else {
        console.log('[DEBUG] OrderPage: Missing authentication data');
        setIsAuthenticated(false);
      }
    };
    
    // Function to clear invalid auth data
    const clearAuthData = () => {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('user');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_role');
    };
    
    checkAuth();
    
    // Listen for storage changes (in case user logs out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'access' || e.key === 'user') {
        console.log('[DEBUG] OrderPage: Auth data changed in storage');
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogout', () => {
      console.log('[DEBUG] OrderPage: User logout event received');
      setIsAuthenticated(false);
      setUser(null);
    });
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogout', () => {});
    };
  }, []);

  useEffect(() => {
    // Set service location if available
    if (service?.provider_location?.lat && service?.provider_location?.lng) {
      setFormData(prev => ({
        ...prev,
        location_lat: service.provider_location.lat,
        location_lng: service.provider_location.lng,
      }));
    } else if (service?.location_lat && service?.location_lng) {
      // Fallback to legacy location fields
      setFormData(prev => ({
        ...prev,
        location_lat: service.location_lat,
        location_lng: service.location_lng,
      }));
    }
    
    // Set default scheduled time to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormData(prev => ({
      ...prev,
      scheduled_time: tomorrow.toISOString().split('T')[0],
    }));
  }, [service]);

  // Inject CSS similar to Home.jsx
  useEffect(() => {
    if (injected.current) return;
    
    try {
      const css = `
    :root {
      --primary: #0077ff;
      --primary-dark: #0056b3;
      --gradient: linear-gradient(135deg, #0077ff, #4da6ff);
      --bg: #f9fbff;
      --muted: #6b7280;
    }
    body { 
      background: var(--bg); 
      color: #0f172a; 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    }

    /* Order Banner */
    .order-banner {
      background: var(--gradient);
      color: white;
      padding: 3rem 0;
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }
    .order-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }
    .banner-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .banner-subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin: 0;
      font-weight: 400;
    }
    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 1rem;
    }
    .step-text {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-left: 1rem;
    }
    .step-number {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    .step-description {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    .step-circles {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    .step-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      position: relative;
    }
    .step-circle.completed {
      background: white;
      color: var(--primary);
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .step-circle.completed::after {
      content: '✓';
      position: absolute;
      font-size: 0.8rem;
      color: #28a745;
      font-weight: bold;
    }
    .step-circle.active {
      background: white;
      color: var(--primary);
      border: 2px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: scale(1.1);
    }
    .step-circle:not(.completed):not(.active) {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    /* Service Card */
    .service-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 6px 18px rgba(0,0,0,.05);
      border: 1px solid rgba(0, 119, 255, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
      margin-bottom: 2rem;
    }
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    .service-card-header {
      background: linear-gradient(135deg, #f8f9ff, #e3f2fd);
      padding: 1.5rem;
      border-bottom: 1px solid rgba(0, 119, 255, 0.1);
    }
    .service-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }
    .service-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1.5rem;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid var(--primary);
    }
    .info-icon {
      color: var(--primary);
      font-size: 1.1rem;
    }
    .info-label {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }
    .info-value {
      color: #666;
      font-size: 0.9rem;
    }

    /* Form Styles */
    .order-form {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 6px 18px rgba(0,0,0,.05);
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .form-section {
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 20px;
      background: var(--gradient);
      border-radius: 2px;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-label {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
      display: block;
    }
    .form-control {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 0.8rem 1rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }
    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(0, 119, 255, 0.1);
      transform: translateY(-1px);
    }
    .form-control.is-invalid {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
    .invalid-feedback {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    /* Button Styles */
    .btn-primary {
      background: var(--gradient);
      border: none;
      border-radius: 8px;
      padding: 0.8rem 2rem;
      font-weight: 600;
      font-size: 1rem;
      color: white;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 119, 255, 0.3);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 119, 255, 0.4);
      background: linear-gradient(135deg, #0056b3, #3d8bff);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .btn-secondary {
      background: #f8f9fa;
      border: 2px solid #e0e0e0;
      color: #666;
      border-radius: 8px;
      padding: 0.8rem 2rem;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .btn-secondary:hover:not(:disabled) {
      background: #e9ecef;
      border-color: #adb5bd;
      transform: translateY(-1px);
    }

    /* Loading States */
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Alert Messages */
    .alert {
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      border: 1px solid transparent;
    }
    .alert-success {
      background: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    .alert-danger {
      background: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }
    .alert-warning {
      background: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }

    /* Login Required Card */
    .login-required-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 6px 18px rgba(0,0,0,.05);
      padding: 3rem;
      text-align: center;
      margin: 2rem 0;
    }
    .login-icon {
      font-size: 4rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }

    /* RTL Support */
    [dir="rtl"] .step-text {
      align-items: flex-start;
    }
    [dir="rtl"] .info-item {
      border-left: none;
      border-right: 4px solid var(--primary);
    }
    [dir="rtl"] .section-title::before {
      order: 1;
    }

    /* Print Styles */
    @media print {
      .order-banner, .btn, .step-indicator {
        display: none !important;
      }
      .service-card, .order-form {
        box-shadow: none !important;
        border: 1px solid #ddd !important;
      }
      body { background: white !important; }
    }

    /* Button Outline Primary */
    .btn-outline-primary {
      border: 2px solid var(--primary);
      color: var(--primary);
      background: transparent;
      border-radius: 8px;
      padding: 0.8rem 2rem;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .btn-outline-primary:hover:not(:disabled) {
      background: var(--primary);
      color: white;
      transform: translateY(-1px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .banner-title { font-size: 2rem; }
      .banner-subtitle { font-size: 1rem; }
      .step-indicator {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
      }
      .step-text {
        align-items: center;
        margin-left: 0;
      }
      .service-info {
        grid-template-columns: 1fr;
      }
      .order-form {
        padding: 1.5rem;
      }
      .d-flex.gap-3.justify-content-between {
        flex-direction: column;
        gap: 1rem;
      }
      .d-flex.gap-2 {
        justify-content: center;
      }
    }
    `;
    
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
      injected.current = true;
    } catch (error) {
      console.error('Error injecting CSS:', error);
      injected.current = true; // Still mark as injected to prevent retry
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if service is selected
    if (!service || !service.id) {
      newErrors.service = "لا توجد خدمة مختارة";
      return false;
    }
    
    // Description validation (optional in backend but recommended)
    if (!formData.description.trim()) {
      newErrors.description = "يرجى إدخال وصف للطلب";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "يجب أن يكون الوصف 10 أحرف على الأقل";
    }
    
    // Price validation (optional in backend)
    if (formData.offered_price && (isNaN(formData.offered_price) || parseFloat(formData.offered_price) < 0)) {
      newErrors.offered_price = "يرجى إدخال سعر صحيح";
    }
    
    // Scheduled time validation (required in backend)
    if (!formData.scheduled_time) {
      newErrors.scheduled_time = "يرجى اختيار موعد للخدمة";
    } else {
      const selectedDate = new Date(formData.scheduled_time);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.scheduled_time = "لا يمكن اختيار تاريخ في الماضي";
      }
    }
    
    // Location validation (optional but helpful)
    if (!formData.location_lat || !formData.location_lng) {
      console.warn("No location data available for the order");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check authentication before submission
    if (!isAuthenticated || !user || !user.id) {
      setErrors({ submit: "يجب عليك تسجيل الدخول أولاً لإنشاء طلب" });
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
      return;
    }
    
    // Verify user role (only clients can create orders)
    if (user.role !== 'client') {
      setErrors({ submit: "يمكن للعملاء فقط إنشاء الطلبات" });
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage("");
    
    try {
      const orderData = {
        service: service.id,
        description: formData.description,
        offered_price: parseFloat(formData.offered_price),
        location_lat: formData.location_lat,
        location_lng: formData.location_lng,
        scheduled_time: new Date(formData.scheduled_time).toISOString(),
      };
      
      const response = await apiService.post(`/api/orders/`, orderData);
      
      console.log('Order created successfully:', response);
      
      // Display success message with order details
      const orderId = response.order?.id || response.id;
      const successMsg = orderId 
        ? `تم تأكيد الطلب بنجاح! رقم الطلب: #${orderId}. سيتم التواصل معك قريباً.`
        : "تم تأكيد الطلب بنجاح! سيتم التواصل معك قريباً.";
      
      setSuccessMessage(successMsg);
      
      // Clean up stored service data
      localStorage.removeItem('selectedService');
      
      // Clear form data
      setFormData({
        description: "",
        offered_price: "",
        location_lat: null,
        location_lng: null,
        scheduled_time: "",
      });
      
      // Start countdown for redirect
      setRedirectCountdown(3);
      const countdownInterval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            // Try to navigate to orders page if it exists, otherwise go to home
            navigate("/orders", { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error("Error creating order:", err.response?.data || err);
      
      // Handle different types of errors
      let errorMessage = "حصل خطأ أثناء تأكيد الطلب";
      let fieldErrors = {};
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle validation errors for specific fields
        if (typeof errorData === 'object' && !errorData.detail && !errorData.message) {
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors[field] = errorData[field][0];
            } else if (typeof errorData[field] === 'string') {
              fieldErrors[field] = errorData[field];
            }
          });
        }
        
        // Handle general error messages
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
          errorMessage = errorData.non_field_errors[0];
        }
      }
      
      // Handle network errors
      if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "فشل في الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت";
      }
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        errorMessage = "انتهت صلاحية جلسة العمل. يرجى تسجيل الدخول مرة أخرى";
        // Redirect to login
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
      
      // Set errors
      if (Object.keys(fieldErrors).length > 0) {
        setErrors({ ...fieldErrors, submit: errorMessage });
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!service) {
    return (
      <div dir="rtl">
        <Navbar />
        <div className="container my-5">
          <div className="login-required-card">
            <i className="fas fa-exclamation-triangle login-icon" style={{color: '#ffc107'}}></i>
            <h2 className="mb-3">لا توجد خدمة مختارة</h2>
            <p className="text-muted mb-4">
              يجب عليك اختيار خدمة أولاً لإنشاء طلب جديد
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/services')}
              >
                <i className="fas fa-search me-2"></i>
                البحث عن الخدمات
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-home me-2"></i>
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show role restriction for workers
  if (isAuthenticated && user && user.role === 'worker') {
    return (
      <div dir="rtl">
        <Navbar />
        
        {/* Blue Banner */}
        <div className="order-banner">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="banner-title">غير مسموح</h1>
                <p className="banner-subtitle">مزودو الخدمة لا يمكنهم إنشاء طلبات</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container my-5">
          <div className="login-required-card">
            <i className="fas fa-user-times login-icon" style={{color: '#dc3545'}}></i>
            <h2 className="mb-3">غير مسموح</h2>
            <p className="text-muted mb-4">
              مزودو الخدمة لا يمكنهم إنشاء طلبات. يمكنك فقط تقديم عروض على الطلبات الموجودة.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/services')}
              >
                <i className="fas fa-list me-2"></i>
                عرض الطلبات المتاحة
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-home me-2"></i>
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return (
      <div dir="rtl">
        <Navbar />
        
        {/* Blue Banner with Step Indicator */}
        <div className="order-banner">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="banner-title">تأكيد حجز الخدمة</h1>
                <p className="banner-subtitle">أكمل بياناتك لتأكيد طلب الخدمة</p>
              </div>
              <div className="col-md-4">
                <div className="step-indicator">
                  <div className="step-text">
                    <span className="step-number">الخطوة 2 من 3</span>
                    <span className="step-description">تأكيد البيانات والحجز</span>
                  </div>
                  <div className="step-circles">
                    <div className="step-circle completed">
                      <span>1</span>
                    </div>
                    <div className="step-circle active">
                      <span>2</span>
                    </div>
                    <div className="step-circle">
                      <span>3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container my-5">
          <div className="login-required-card">
            <i className="fas fa-lock login-icon"></i>
            <h2 className="mb-3">تسجيل الدخول مطلوب</h2>
            <p className="text-muted mb-4">
              يجب عليك تسجيل الدخول أولاً لإكمال طلب الخدمة
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/location')}
              >
                <i className="fas fa-arrow-right me-2"></i>
                العودة للبحث
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/auth')}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                تسجيل الدخول
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <Navbar />
      
      {/* Blue Banner with Step Indicator */}
      <div className="order-banner">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="banner-title">تأكيد حجز الخدمة</h1>
              <p className="banner-subtitle">أكمل بياناتك لتأكيد طلب الخدمة</p>
            </div>
            <div className="col-md-4">
              <div className="step-indicator">
                <div className="step-text">
                  <span className="step-number">الخطوة 2 من 3</span>
                  <span className="step-description">تأكيد البيانات والحجز</span>
                </div>
                <div className="step-circles">
                  <div className="step-circle completed">
                    <span>1</span>
                  </div>
                  <div className="step-circle active">
                    <span>2</span>
                  </div>
                  <div className="step-circle">
                    <span>3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        {/* Service Information Card */}
        <div className="service-card">
          <div className="service-card-header">
            <h3 className="service-title">{service.title || 'خدمة مختارة'}</h3>
            {service.description && (
              <p className="text-muted mb-0">{service.description}</p>
            )}
            {service.category && (
              <span className="badge bg-primary mt-2">{service.category.name || service.category}</span>
            )}
          </div>
          <div className="service-info">
            {(service.provider_username || service.provider) && (
              <div className="info-item">
                <i className="fas fa-user info-icon"></i>
                <div>
                  <div className="info-label">مزود الخدمة</div>
                  <div className="info-value">
                    {service.provider_username || 
                     (service.provider && service.provider.username) || 
                     'مزود خدمة'}
                  </div>
                </div>
              </div>
            )}
            {service.price && (
              <div className="info-item">
                <i className="fas fa-money-bill-wave info-icon"></i>
                <div>
                  <div className="info-label">السعر</div>
                  <div className="info-value">{service.price} {service.currency || 'EGP'}</div>
                </div>
              </div>
            )}
            {service.city && (
              <div className="info-item">
                <i className="fas fa-map-marker-alt info-icon"></i>
                <div>
                  <div className="info-label">المدينة</div>
                  <div className="info-value">{service.city}</div>
                </div>
              </div>
            )}
            {service.provider_location && (
              <div className="info-item">
                <i className="fas fa-location-dot info-icon"></i>
                <div>
                  <div className="info-label">الموقع</div>
                  <div className="info-value">
                    {service.provider_location.lat.toFixed(4)}, {service.provider_location.lng.toFixed(4)}
                  </div>
                </div>
              </div>
            )}
            {service.rating_avg && (
              <div className="info-item">
                <i className="fas fa-star info-icon"></i>
                <div>
                  <div className="info-label">التقييم</div>
                  <div className="info-value">
                    {service.rating_avg.toFixed(1)} ({service.rating_count || 0} تقييم)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle me-2"></i>
            {successMessage}
            {redirectCountdown > 0 && (
              <div className="success-redirect-info">
                <i className="fas fa-clock me-2"></i>
                سيتم توجيهك إلى صفحة الطلبات خلال <span className="countdown">{redirectCountdown}</span> ثواني
              </div>
            )}
          </div>
        )}
        
        {errors.submit && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            {errors.submit}
          </div>
        )}

        {/* Order Form */}
        <div className={`order-form ${isLoading ? 'loading-state' : ''}`}>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-user me-2"></i>
                معلومات العميل
              </h3>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">الاسم</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.name || user?.username || ''}
                      disabled
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ''}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-edit me-2"></i>
                تفاصيل الطلب
              </h3>
              
              <div className="form-group">
                <label className="form-label">وصف الطلب *</label>
                <textarea
                  name="description"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="اكتب وصفاً مفصلاً لما تحتاجه..."
                  required
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">السعر المقترح (جنيه) *</label>
                    <input
                      type="number"
                      name="offered_price"
                      className={`form-control ${errors.offered_price ? 'is-invalid' : ''}`}
                      value={formData.offered_price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                    {errors.offered_price && (
                      <div className="invalid-feedback">{errors.offered_price}</div>
                    )}
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">موعد الخدمة *</label>
                    <input
                      type="date"
                      name="scheduled_time"
                      className={`form-control ${errors.scheduled_time ? 'is-invalid' : ''}`}
                      value={formData.scheduled_time}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    {errors.scheduled_time && (
                      <div className="invalid-feedback">{errors.scheduled_time}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex gap-3 justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/location')}
                disabled={isLoading}
              >
                <i className="fas fa-arrow-right me-2"></i>
                العودة للبحث
              </button>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => window.print()}
                  disabled={isLoading}
                >
                  <i className="fas fa-print me-2"></i>
                  طباعة الطلب
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      تأكيد الطلب
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
