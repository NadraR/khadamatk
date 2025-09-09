import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiService from "../services/ApiService";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";

const OrderPage = () => {
  console.log('[DEBUG] OrderPage: Component rendering started');
  
  const injected = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get service data from localStorage or location.state
  // Check if we're in edit mode
  const editMode = location.state?.editMode || false;
  const orderData = location.state?.orderData || null;
  
  const service = useMemo(() => {
    // If in edit mode, use service data from orderData
    if (editMode && orderData) {
      return location.state?.service || {
        id: orderData.service_id,
        title: orderData.service_name,
        base_price: orderData.offered_price
      };
    }
    
    // Check for reorder data first (from TrackOrder page)
    let data = null;
    const reorderData = localStorage.getItem('reorderData');
    if (reorderData) {
      try {
        data = JSON.parse(reorderData);
        console.log('[DEBUG] OrderPage: Loaded reorder data:', data);
        // Clear reorder data after loading
        localStorage.removeItem('reorderData');
      } catch (error) {
        console.error('Error parsing reorder data:', error);
      }
    }
    
    // Check for pending order data (from booking flow)
    if (!data) {
      const pendingOrder = localStorage.getItem('pendingOrder');
      if (pendingOrder) {
        try {
          data = JSON.parse(pendingOrder);
          console.log('[DEBUG] OrderPage: Loaded pending order data:', data);
        } catch (error) {
          console.error('Error parsing pending order:', error);
        }
      }
    }
    
    // Fallback to selectedService if no pending order
    if (!data) {
    const storedService = localStorage.getItem('selectedService');
    if (storedService) {
      try {
          data = JSON.parse(storedService);
          console.log('[DEBUG] OrderPage: Loaded stored service data:', data);
      } catch (error) {
        console.error('Error parsing stored service:', error);
      }
    }
  }
    
    // Final fallback to location state
    if (!data) {
      data = location.state?.service || null;
      console.log('[DEBUG] OrderPage: Using location state data:', data);
    }
    
    console.log('[DEBUG] OrderPage: Final service data:', data);
    console.log('[DEBUG] OrderPage: Edit mode:', editMode);
    return data;
  }, [location.state, editMode, orderData]);

  const [formData, setFormData] = useState(() => {
    // If in edit mode, populate form with existing order data
    if (editMode && orderData) {
      return {
        description: orderData.description || "",
        offered_price: orderData.offered_price || "",
        location_lat: orderData.location_lat || null,
        location_lng: orderData.location_lng || null,
        location_address: orderData.location_address || "",
        scheduled_time: orderData.scheduled_time ? 
          new Date(orderData.scheduled_time).toISOString().slice(0, 16) : "",
        delivery_time: orderData.delivery_time ? 
          new Date(orderData.delivery_time).toISOString().slice(0, 16) : "",
      };
    }
    
    // Check for reorder data first (from TrackOrder page)
    const reorderData = localStorage.getItem('reorderData');
    if (reorderData) {
      try {
        const data = JSON.parse(reorderData);
        console.log('[DEBUG] OrderPage: Found reorder data for form:', data);
        return {
          description: data.description || "",
          offered_price: data.offered_price || "",
          location_lat: data.location?.lat || data.selectedLocation?.lat || null,
          location_lng: data.location?.lng || data.selectedLocation?.lng || null,
          location_address: data.location_address || "",
          scheduled_time: data.scheduled_time ? 
            new Date(data.scheduled_time).toISOString().slice(0, 16) : "",
          delivery_time: data.delivery_time ? 
            new Date(data.delivery_time).toISOString().slice(0, 16) : "",
        };
      } catch (error) {
        console.error('Error parsing reorder data for form:', error);
      }
    }
    
    // Check for pending order or stored service data to populate location
    let locationData = null;
    let locationAddress = '';
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (pendingOrder) {
      try {
        const orderData = JSON.parse(pendingOrder);
        locationData = orderData.selectedLocation;
        locationAddress = orderData.location_address || '';
        console.log('[DEBUG] OrderPage: Found location in pending order:', locationData);
        console.log('[DEBUG] OrderPage: Found location address in pending order:', locationAddress);
      } catch (error) {
        console.error('Error parsing pending order for location:', error);
      }
    }
    
    // Fallback to selectedService
    if (!locationData) {
      const storedService = localStorage.getItem('selectedService');
      if (storedService) {
        try {
          const serviceData = JSON.parse(storedService);
          locationData = serviceData.selectedLocation;
          locationAddress = serviceData.location_address || '';
          console.log('[DEBUG] OrderPage: Found location in stored service:', locationData);
          console.log('[DEBUG] OrderPage: Found location address in stored service:', locationAddress);
        } catch (error) {
          console.error('Error parsing stored service for location:', error);
        }
      }
    }
    
    // Default form with location data if available
    return {
    description: "",
    offered_price: "",
      location_lat: locationData?.lat || null,
      location_lng: locationData?.lng || null,
      location_address: locationAddress || "",
    scheduled_time: "",
      delivery_time: "",
    };
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Update formData when service data becomes available
  useEffect(() => {
    if (service && service.selectedLocation && (!formData.location_lat || !formData.location_lng)) {
      console.log('[DEBUG] OrderPage: Updating formData with location from service');
      setFormData(prev => ({
        ...prev,
        location_lat: service.selectedLocation.lat,
        location_lng: service.selectedLocation.lng,
        location_address: service.location_address || prev.location_address
      }));
    }
  }, [service, formData.location_lat, formData.location_lng, formData.location_address]);

  // Handle reorder data when component mounts
  useEffect(() => {
    const reorderData = localStorage.getItem('reorderData');
    if (reorderData && service) {
      try {
        const data = JSON.parse(reorderData);
        console.log('[DEBUG] OrderPage: Processing reorder data:', data);
        
        // Update form with reorder data
        setFormData(prev => ({
          ...prev,
          description: data.description || prev.description,
          offered_price: data.offered_price || prev.offered_price,
          location_lat: data.location?.lat || prev.location_lat,
          location_lng: data.location?.lng || prev.location_lng,
          location_address: data.location_address || prev.location_address,
          scheduled_time: data.scheduled_time ? 
            new Date(data.scheduled_time).toISOString().slice(0, 16) : prev.scheduled_time,
          delivery_time: data.delivery_time ? 
            new Date(data.delivery_time).toISOString().slice(0, 16) : prev.delivery_time,
        }));
        
        // Clear reorder data after processing
        localStorage.removeItem('reorderData');
        
        // Show success message
        toast.success('تم تحميل بيانات الطلب السابق. يمكنك تعديلها حسب الحاجة.');
      } catch (error) {
        console.error('Error processing reorder data:', error);
        toast.error('حدث خطأ أثناء تحميل بيانات الطلب السابق');
      }
    }
  }, [service, formData.location_address]);

  // Load saved location from localStorage first
  useEffect(() => {
    const savedLocation = localStorage.getItem("selectedLocation");
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        setFormData(prev => ({
          ...prev,
          location_lat: parsed.lat,
          location_lng: parsed.lng,
          location_address: parsed.address || ''
        }));
      } catch (err) {
        console.error("Error parsing saved location:", err);
      }
    }
  }, []);

  // Load client's saved location automatically
  useEffect(() => {
    const loadClientLocation = async () => {
      // Only load if user is authenticated and no location data is already present
      if (isAuthenticated && user && (!formData.location_lat || !formData.location_lng)) {
        try {
          console.log('[DEBUG] OrderPage: Loading client saved location...');
          console.log('[DEBUG] OrderPage: Current formData location:', { lat: formData.location_lat, lng: formData.location_lng });
          console.log('[DEBUG] OrderPage: Service location:', service?.location);
          
          const { locationService } = await import('../services/LocationService');
          const result = await locationService.getLatestLocation();
          
          if (result.success && result.data && result.data.lat && result.data.lng) {
            console.log('[DEBUG] OrderPage: Found saved location:', result.data);
            setFormData(prev => ({
              ...prev,
              location_lat: result.data.lat,
              location_lng: result.data.lng,
              location_address: result.data.address || prev.location_address
            }));
            toast.success('تم تحميل موقعك المحفوظ تلقائياً', {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              rtl: true,
            });
          } else {
            console.log('[DEBUG] OrderPage: No saved location found or invalid data');
            
            // Try to get location from service data if available
            if (service?.location?.lat && service?.location?.lng) {
              console.log('[DEBUG] OrderPage: Using location from service data');
              setFormData(prev => ({
                ...prev,
                location_lat: service.location.lat,
                location_lng: service.location.lng,
                location_address: service.location.address || prev.location_address
              }));
            }
          }
        } catch (error) {
          console.error('[DEBUG] OrderPage: Error loading saved location:', error);
          
          // Try to get location from service data as fallback
          if (service?.location?.lat && service?.location?.lng) {
            console.log('[DEBUG] OrderPage: Using service location as fallback');
            setFormData(prev => ({
              ...prev,
              location_lat: service.location.lat,
              location_lng: service.location.lng,
              location_address: service.location.address || prev.location_address
            }));
          }
        }
      }
    };
    
    loadClientLocation();
  }, [isAuthenticated, user, service?.location, formData.location_lat, formData.location_lng]);

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
    
    // Set default scheduled time to tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Set to 9:00 AM
    setFormData(prev => ({
      ...prev,
      scheduled_time: tomorrow.toISOString().slice(0, 16),
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
      background: linear-gradient(135deg, #0077ff 0%, #4da6ff 50%, #80c7ff 100%);
      color: white;
      padding: 1rem 0;
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
      border-radius: 0 0 24px 24px;
      box-shadow: 0 8px 32px rgba(0, 119, 255, 0.3);
    }
    .order-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse"><polygon points="25,0 50,14.43 50,28.87 25,43.3 0,28.87 0,14.43" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.08)"/></pattern></defs><rect width="100%25" height="100%25" fill="url(%23hexagons)"/><rect width="100%25" height="100%25" fill="url(%23dots)"/></svg>');
      opacity: 0.4;
    }
    .order-banner::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 40%;
      height: 200%;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 70%);
      transform: rotate(15deg);
      pointer-events: none;
    }
    .banner-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 0.2rem;
      text-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
      background: linear-gradient(135deg, #ffffff, #f0f8ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
    }
    .banner-subtitle {
      font-size: 0.9rem;
      opacity: 0.95;
      margin: 0;
      font-weight: 500;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      letter-spacing: 0.3px;
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

    /* Button Outline Success */
    .btn-outline-success {
      border: 2px solid #28a745;
      color: #28a745;
      background: transparent;
      border-radius: 8px;
      padding: 0.8rem 2rem;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    .btn-outline-success:hover:not(:disabled) {
      background: #28a745;
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

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
    // Redirect to HomeClient
    console.log('[DEBUG] Redirecting to /home-client from success modal');
    navigate("/home-client", { replace: true });
  };

  const handlePrintOrder = () => {
    // Create a comprehensive order document
    const orderDocument = generateOrderDocument();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(orderDocument);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      
      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    };
  };

  const handleDownloadOrder = () => {
    // Create a comprehensive order document
    const orderDocument = generateOrderDocument();
    
    // Create a blob with the HTML content
    const blob = new Blob([orderDocument], { type: 'text/html;charset=utf-8' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const orderNumber = Math.floor(Math.random() * 1000000) + 100000;
    link.download = `order-${orderNumber}-${currentDate}.html`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    // Show success message
    toast.success('تم تحميل تفاصيل الطلب بنجاح', {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      rtl: true,
    });
  };

  const generateOrderDocument = () => {
    const currentDate = new Date().toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const orderNumber = Math.floor(Math.random() * 1000000) + 100000; // Generate order number

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تفاصيل الطلب - ${orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #0077ff, #4da6ff);
            color: white;
            border-radius: 10px;
          }
          
          .header h1 {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          
          .header p {
            font-size: 1.1rem;
            opacity: 0.9;
          }
          
          .order-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .info-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-right: 4px solid #0077ff;
          }
          
          .info-section h3 {
            color: #0077ff;
            margin-bottom: 15px;
            font-size: 1.2rem;
          }
          
          .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #e9ecef;
          }
          
          .info-item:last-child {
            border-bottom: none;
          }
          
          .info-label {
            font-weight: 600;
            color: #495057;
          }
          
          .info-value {
            color: #6c757d;
          }
          
          .service-details {
            background: white;
            border: 2px solid #0077ff;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
          }
          
          .service-details h3 {
            color: #0077ff;
            margin-bottom: 20px;
            font-size: 1.3rem;
            text-align: center;
          }
          
          .service-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .service-description {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-right: 4px solid #28a745;
          }
          
          .order-details {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .order-details h4 {
            color: #856404;
            margin-bottom: 15px;
          }
          
          .price-highlight {
            background: #d4edda;
            border: 2px solid #c3e6cb;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            margin: 20px 0;
          }
          
          .price-highlight .price-label {
            font-size: 1.1rem;
            color: #155724;
            font-weight: 600;
          }
          
          .price-highlight .price-value {
            font-size: 2rem;
            color: #28a745;
            font-weight: 700;
            margin-top: 5px;
          }
          
          .footer {
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            text-align: center;
            border-top: 3px solid #0077ff;
          }
          
          .footer p {
            color: #6c757d;
            margin-bottom: 10px;
          }
          
          .footer .order-number {
            font-size: 1.2rem;
            font-weight: 700;
            color: #0077ff;
          }
          
          @media print {
            body { padding: 0; }
            .header { page-break-inside: avoid; }
            .service-details { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تفاصيل الطلب</h1>
          <p>تاريخ الطباعة: ${currentDate}</p>
        </div>
        
        <div class="order-info">
          <div class="info-section">
            <h3>معلومات العميل</h3>
            <div class="info-item">
              <span class="info-label">الاسم:</span>
              <span class="info-value">${user?.name || user?.username || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">البريد الإلكتروني:</span>
              <span class="info-value">${user?.email || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">رقم الطلب:</span>
              <span class="info-value">#${orderNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاريخ الطلب:</span>
              <span class="info-value">${currentDate}</span>
            </div>
          </div>
          
          <div class="info-section">
            <h3>معلومات الخدمة</h3>
            <div class="info-item">
              <span class="info-label">نوع الخدمة:</span>
              <span class="info-value">${service?.title || 'خدمة مختارة'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الفئة:</span>
              <span class="info-value">${service?.category?.name || service?.category || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">مزود الخدمة:</span>
              <span class="info-value">${service?.provider_username || (service?.provider && service.provider.username) || 'مزود خدمة'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الموقع:</span>
              <span class="info-value">${formData.location_lat ? `${formData.location_lat.toFixed(4)}, ${formData.location_lng.toFixed(4)}` : 'غير محدد'}</span>
            </div>
          </div>
        </div>
        
        <div class="service-details">
          <h3>تفاصيل الخدمة المطلوبة</h3>
          <div class="service-title">${service?.title || 'خدمة مختارة'}</div>
          
          ${service?.description ? `
            <div class="service-description">
              <strong>وصف الخدمة:</strong><br>
              ${service.description}
            </div>
          ` : ''}
          
          <div class="order-details">
            <h4>تفاصيل الطلب</h4>
            <div class="info-item">
              <span class="info-label">وصف الطلب:</span>
              <span class="info-value">${formData.description || 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاريخ بدء العمل:</span>
              <span class="info-value">${formData.scheduled_time ? new Date(formData.scheduled_time).toLocaleString('ar-SA') : 'غير محدد'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاريخ إنجاز العمل:</span>
              <span class="info-value">${formData.delivery_time ? new Date(formData.delivery_time).toLocaleString('ar-SA') : 'غير محدد'}</span>
            </div>
          </div>
          
          <div class="price-highlight">
            <div class="price-label">السعر المقترح</div>
            <div class="price-value">${formData.offered_price || '0'} جنيه مصري</div>
          </div>
        </div>
        
        <div class="footer">
          <p>شكراً لاختيارك خدماتنا</p>
          <p>سيتم التواصل معك قريباً لتأكيد الطلب</p>
          <p class="order-number">رقم الطلب: #${orderNumber}</p>
          <p>تاريخ الطباعة: ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
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
      newErrors.scheduled_time = "يرجى تحديد تاريخ ووقت بدء العمل";
    } else {
      const selectedDateTime = new Date(formData.scheduled_time);
      const now = new Date();
      
      if (selectedDateTime <= now) {
        newErrors.scheduled_time = "يجب أن يكون وقت بدء العمل في المستقبل";
      }
    }

    // Delivery time validation (required)
    if (!formData.delivery_time) {
      newErrors.delivery_time = "يرجى تحديد تاريخ ووقت إنجاز العمل";
    } else {
      const deliveryDateTime = new Date(formData.delivery_time);
      const scheduledDateTime = new Date(formData.scheduled_time);
      const now = new Date();
      
      if (deliveryDateTime <= now) {
        newErrors.delivery_time = "يجب أن يكون وقت إنجاز العمل في المستقبل";
      } else if (formData.scheduled_time && deliveryDateTime <= scheduledDateTime) {
        newErrors.delivery_time = "يجب أن يكون وقت إنجاز العمل بعد وقت بدء العمل";
      }
    }
    
    // Location validation (optional but helpful)
    if (!formData.location_lat || !formData.location_lng) {
      console.warn("No location data available for the order");
      console.warn("Current formData:", formData);
      console.warn("Current service data:", service);
      
      // Try to get location data from service if available
      if (service?.selectedLocation) {
        console.log("Found location in service data, updating formData");
        setFormData(prev => ({
          ...prev,
          location_lat: service.selectedLocation.lat,
          location_lng: service.selectedLocation.lng
        }));
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check authentication before submission
    if (!isAuthenticated || !user || !user.id) {
      const errorMsg = "يجب عليك تسجيل الدخول أولاً لإنشاء طلب";
      setErrors({ submit: errorMsg });
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        rtl: true,
      });
      setTimeout(() => {
        navigate('/auth');
      }, 2000);
      return;
    }
    
    // Verify user role (only clients can create orders)
    if (user.role !== 'client') {
      const errorMsg = "يمكن للعملاء فقط إنشاء الطلبات";
      setErrors({ submit: errorMsg });
      toast.error(errorMsg, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        rtl: true,
      });
      return;
    }
    
    if (!validateForm()) {
      // Show validation error toast
      toast.error("يرجى تصحيح الأخطاء في النموذج", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        rtl: true,
      });
      return;
    }
    
    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
      // Debug logging before creating request
      console.log('[DEBUG] OrderPage: Preparing order submission');
      console.log('[DEBUG] Service data:', service);
      console.log('[DEBUG] Form data:', formData);
      console.log('[DEBUG] User data:', user);
      
      // Handle service ID - the search returns worker/location ID, not service ID
      let serviceId = service?.id;
      
      console.log('[DEBUG] OrderPage: Original service ID from search:', serviceId);
      console.log('[DEBUG] OrderPage: Service object keys:', Object.keys(service || {}));
      
      // The search returns worker data, not service data, so we need to find a valid service
      // Check if this ID actually exists as a service, if not use a fallback
      
      // Available service IDs from database: 7, 8, 9, 10, 11, 12, 13, 14, 15, 16
      const validServiceIds = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      
      if (!serviceId || !validServiceIds.includes(serviceId)) {
        console.log('[DEBUG] OrderPage: Service ID not valid or not in database, attempting to create service');
        
        // Try to create a service for this worker
        if (service?.user_id || service?.worker_id) {
          const workerId = service.user_id || service.worker_id;
          console.log('[DEBUG] OrderPage: Creating service for worker ID:', workerId);
          
          try {
            const createServiceResponse = await apiService.post('/api/services/create-for-worker/', {
              worker_id: workerId,
              title: service?.title || 'خدمة مخصصة',
              description: service?.description || 'خدمة مخصصة للطلب',
              category_id: 1, // Default category - Electricians
              price: service?.price || 0
            });
            
            if (createServiceResponse.id) {
              serviceId = createServiceResponse.id;
              console.log('[DEBUG] OrderPage: Successfully created/found service ID:', serviceId);
            } else {
              throw new Error('No service returned from API');
            }
          } catch (createError) {
            console.error('[DEBUG] OrderPage: Failed to create service:', createError);
            
            // Fallback to mapping based on job title
            if (service?.worker_profile?.job_title) {
              const jobTitle = service.worker_profile.job_title.toLowerCase();
              console.log('[DEBUG] OrderPage: Using job title fallback:', jobTitle);
              
              if (jobTitle.includes('كهربائي') || jobTitle.includes('electrical')) {
                serviceId = 16; // mazen-salem's service
              } else if (jobTitle.includes('تنظيف') || jobTitle.includes('cleaning')) {
                serviceId = 15; // "تنظيف منزل شامل"
              } else {
                serviceId = 7; // Default fallback service
              }
            } else {
              console.log('[DEBUG] OrderPage: No job title found, using default service ID 7');
              serviceId = 7; // Default fallback
            }
          }
        } else {
          console.log('[DEBUG] OrderPage: No worker ID found, using default service ID 7');
          serviceId = 7; // Default fallback
        }
      } else {
        console.log('[DEBUG] OrderPage: Service ID is valid:', serviceId);
      }
      
      // Try to get location data from various sources
      let locationLat = formData.location_lat;
      let locationLng = formData.location_lng;
      let locationAddress = formData.location_address;

      console.log('[DEBUG] OrderPage: Initial location data:', { locationLat, locationLng, locationAddress });
      console.log('[DEBUG] OrderPage: Service data available:', { 
        hasService: !!service, 
        serviceLat: service?.lat, 
        serviceLng: service?.lng, 
        serviceAddress: service?.address 
      });

      // If no location in form data, try to get from service data
      if (!locationLat || !locationLng) {
        // Check if service has location data directly
        if (service?.lat && service?.lng) {
          locationLat = service.lat;
          locationLng = service.lng;
          locationAddress = locationAddress || service.address || '';
          console.log('[DEBUG] OrderPage: Using location from service data (direct):', { locationLat, locationLng, locationAddress });
        }
        // Also check nested location object
        else if (service?.location?.lat && service?.location?.lng) {
          locationLat = service.location.lat;
          locationLng = service.location.lng;
          locationAddress = locationAddress || service.location.address || '';
          console.log('[DEBUG] OrderPage: Using location from service data (nested):', { locationLat, locationLng, locationAddress });
        }
      }

      // If still no location, try to load from backend
      if (!locationLat || !locationLng) {
        try {
          console.log('[DEBUG] OrderPage: Attempting to load location from backend...');
          const { locationService } = await import('../services/LocationService');
          const result = await locationService.getLatestLocation();
          
          if (result.success && result.data) {
            locationLat = result.data.lat;
            locationLng = result.data.lng;
            locationAddress = locationAddress || result.data.address || '';
            console.log('[DEBUG] OrderPage: Successfully loaded location from backend:', { locationLat, locationLng, locationAddress });
            
            // Update form data for future use
            setFormData(prev => ({
              ...prev,
              location_lat: locationLat,
              location_lng: locationLng,
              location_address: locationAddress
            }));
          } else {
            // If no location from backend, use service location or default
            if (service?.lat && service?.lng) {
              locationLat = service.lat;
              locationLng = service.lng;
              locationAddress = locationAddress || service.address || 'موقع الخدمة';
              console.log('[DEBUG] OrderPage: Using service location as fallback:', { locationLat, locationLng, locationAddress });
            } else {
              // Use default location (Cairo)
              locationLat = 30.0444;
              locationLng = 31.2357;
              locationAddress = locationAddress || 'القاهرة، مصر';
              console.log('[DEBUG] OrderPage: Using default location (Cairo):', { locationLat, locationLng, locationAddress });
            }
          }
        } catch (locationError) {
          console.error('[DEBUG] OrderPage: Error loading location from backend:', locationError);
          // Use service location or default as fallback
          if (service?.lat && service?.lng) {
            locationLat = service.lat;
            locationLng = service.lng;
            locationAddress = locationAddress || service.address || 'موقع الخدمة';
            console.log('[DEBUG] OrderPage: Using service location as error fallback:', { locationLat, locationLng, locationAddress });
          } else {
            // Use default location as fallback
            locationLat = 30.0444;
            locationLng = 31.2357;
            locationAddress = locationAddress || 'القاهرة، مصر';
            console.log('[DEBUG] OrderPage: Using default location as error fallback:', { locationLat, locationLng, locationAddress });
          }
        }
      }

      // Final check - if still no location, use service location or throw error
      if (!locationLat || !locationLng) {
        if (service?.lat && service?.lng) {
          locationLat = service.lat;
          locationLng = service.lng;
          locationAddress = locationAddress || service.address || 'موقع الخدمة';
          console.log('[DEBUG] OrderPage: Final fallback to service location:', { locationLat, locationLng, locationAddress });
        } else {
          console.error('[DEBUG] OrderPage: No location data available from any source');
          throw new Error('بيانات الموقع مطلوبة - يرجى تحديد موقعك أو التأكد من حفظ موقعك في الملف الشخصي');
        }
      }

      console.log('[DEBUG] OrderPage: Final location data before submission:', { locationLat, locationLng, locationAddress });
      
      const requestData = {
        service: serviceId,
        description: formData.description || `طلب خدمة من ${service?.worker_name || 'مزود الخدمة'}`,
        offered_price: parseFloat(formData.offered_price),
        location_lat: locationLat,
        location_lng: locationLng,
        location_address: locationAddress || 'عنوان غير محدد',
        scheduled_time: new Date(formData.scheduled_time).toISOString(),
        delivery_time: new Date(formData.delivery_time).toISOString(),
      };
      
      console.log('[DEBUG] Request data:', requestData);
      
      let response;
      if (editMode && orderData) {
        // Update existing order
        response = await apiService.put(`/api/orders/${orderData.id}/`, requestData);
      } else {
        // Create new order
        response = await apiService.post(`/api/orders/`, requestData);
      }
      
      console.log(editMode ? 'Order updated successfully:' : 'Order created successfully:', response);
      
      // Display success message with order details
      const orderId = response.order?.id || response.id || orderData?.id;
      let successMsg;
      if (editMode) {
        successMsg = orderId 
          ? `تم تحديث الطلب بنجاح! رقم الطلب: #${orderId}.`
          : "تم تحديث الطلب بنجاح!";
      } else {
        successMsg = orderId 
          ? `تم تأكيد الطلب بنجاح! رقم الطلب: #${orderId}. سيتم التواصل معك قريباً.`
          : "تم تأكيد الطلب بنجاح! سيتم التواصل معك قريباً.";
      }
      
      // Show success modal with OK button
      setSuccessMessage(successMsg);
      setShowSuccessModal(true);
      
      // Clean up stored service data and pending order
      localStorage.removeItem('selectedService');
      localStorage.removeItem('pendingOrder');
      console.log('[DEBUG] OrderPage: Cleaned up pending order data after successful submission');
      
      // Clear form data
      setFormData({
        description: "",
        offered_price: "",
        location_lat: null,
        location_lng: null,
        scheduled_time: "",
        delivery_time: "",
      });
      
    } catch (err) {
      console.error("Error creating/updating order:", err.response?.data || err);
      
      // Handle different types of errors
      let errorMessage = editMode ? "حصل خطأ أثناء تحديث الطلب" : "حصل خطأ أثناء تأكيد الطلب";
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
        // Show error toast
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          rtl: true,
        });
        // Redirect to login
      setTimeout(() => {
          navigate('/auth');
      }, 2000);
        return;
      }
      
      // Show error toast notification
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        rtl: true,
      });
      
      // Set errors for form validation display
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
              <h1 className="banner-title">
                {editMode ? 'تعديل الطلب' : 'تأكيد حجز الخدمة'}
              </h1>
              <p className="banner-subtitle">
                {editMode ? 'قم بتعديل بيانات طلبك' : 'أكمل بياناتك لتأكيد طلب الخدمة'}
              </p>
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
        
        {/* Error Messages */}
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
                    <label className="form-label">تاريخ ووقت بدء العمل *</label>
                    <input
                      type="datetime-local"
                      name="scheduled_time"
                      className={`form-control ${errors.scheduled_time ? 'is-invalid' : ''}`}
                      value={formData.scheduled_time}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                    {errors.scheduled_time && (
                      <div className="invalid-feedback">{errors.scheduled_time}</div>
                    )}
                    <small className="form-text text-muted">
                      متى تريد أن يبدأ مزود الخدمة العمل؟
                    </small>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="form-group">
                    <label className="form-label">تاريخ ووقت إنجاز العمل *</label>
                    <input
                      type="datetime-local"
                      name="delivery_time"
                      className={`form-control ${errors.delivery_time ? 'is-invalid' : ''}`}
                      value={formData.delivery_time}
                      onChange={handleChange}
                      min={formData.scheduled_time ? new Date(formData.scheduled_time).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
                      required
                    />
                    {errors.delivery_time && (
                      <div className="invalid-feedback">{errors.delivery_time}</div>
                    )}
                    <small className="form-text text-muted">
                      متى تتوقع أن يكتمل العمل ويتم تسليمه؟
                    </small>
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
                  onClick={handlePrintOrder}
                  disabled={isLoading}
                >
                  <i className="fas fa-print me-2"></i>
                  طباعة الطلب
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={handleDownloadOrder}
                  disabled={isLoading}
                >
                  <i className="fas fa-download me-2"></i>
                  تحميل الطلب
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
                      {editMode ? 'حفظ التعديلات' : 'تأكيد الطلب'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <div className="modal-header" style={{ 
                background: 'linear-gradient(135deg, #28a745, #20c997)', 
                color: 'white', 
                borderRadius: '15px 15px 0 0',
                border: 'none',
                padding: '1.5rem'
              }}>
                <h5 className="modal-title d-flex align-items-center" style={{ fontSize: '1.3rem', fontWeight: '600' }}>
                  <i className="fas fa-check-circle me-3" style={{ fontSize: '1.5rem' }}></i>
                  {editMode ? 'تم تحديث الطلب بنجاح!' : 'تم تأكيد الطلب بنجاح!'}
                </h5>
              </div>
              <div className="modal-body" style={{ padding: '2rem', textAlign: 'center' }}>
                <div className="success-icon mb-4">
                  <i className="fas fa-check-circle" style={{ 
                    fontSize: '4rem', 
                    color: '#28a745',
                    textShadow: '0 2px 10px rgba(40,167,69,0.3)'
                  }}></i>
                </div>
                <p style={{ 
                  fontSize: '1.1rem', 
                  color: '#495057', 
                  lineHeight: '1.6',
                  marginBottom: '1.5rem'
                }}>
                  {successMessage}
                </p>
                <div className="success-details" style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem'
                }}>
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-2"></i>
                    يمكنك متابعة حالة طلبك من صفحة "طلباتي" في لوحة التحكم
                  </small>
                </div>
              </div>
              <div className="modal-footer" style={{ 
                border: 'none', 
                padding: '1rem 2rem 2rem 2rem',
                justifyContent: 'center'
              }}>
                <button 
                  type="button" 
                  className="btn btn-success btn-lg"
                  onClick={handleSuccessModalClose}
                  style={{
                    borderRadius: '50px',
                    padding: '0.8rem 3rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(40,167,69,0.3)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #28a745, #20c997)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(40,167,69,0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(40,167,69,0.3)';
                  }}
                >
                  <i className="fas fa-home me-2"></i>
                  انتقل إلى لوحة التحكم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;
