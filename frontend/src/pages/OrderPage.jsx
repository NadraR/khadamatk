import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiService } from "../services/ApiService";
import Navbar from "../components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./OrderPage.css";

const OrderPage = () => {
  const injected = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
  const apiService = new ApiService();

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

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      
      if (accessToken && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    // Set service location if available
    if (service?.location_lat && service?.location_lng) {
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

  // Set up global styles for the page
  useEffect(() => {
    if (injected.current) return;
    
    // Add body background and font styles
    const originalBodyStyle = document.body.style.cssText;
    document.body.style.cssText += `
      background: #f9fbff;
      color: #0f172a; 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    `;
    
    injected.current = true;
    
    // Cleanup function
    return () => {
      document.body.style.cssText = originalBodyStyle;
    };
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
    
    if (!formData.description.trim()) {
      newErrors.description = t("orderPage.errors.descriptionRequired");
    }
    
    if (!formData.offered_price || formData.offered_price <= 0) {
      newErrors.offered_price = t("orderPage.errors.priceRequired");
    }
    
    if (!formData.scheduled_time) {
      newErrors.scheduled_time = t("orderPage.errors.dateRequired");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      
      await apiService.post(`/orders/`, orderData);
      
      setSuccessMessage(t("orderPage.successMessage"));
      
      // Clean up stored service data
      localStorage.removeItem('selectedService');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      console.error("Error creating order:", err.response?.data || err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          t("orderPage.errors.submitError");
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (!service) return <p>❌ {t("orderPage.noServiceSelected")}</p>;

  // Show login required if not authenticated
  if (!isAuthenticated) {
    return (
      <div dir="rtl">
        <Navbar />
        
        {/* Blue Banner with Step Indicator */}
        <div className="order-banner">
          <div className="banner-container">
            <div className="banner-content">
              <div className="banner-pagination">
                <nav aria-label="Order steps">
                  <ul className="pagination pagination-sm mb-0">
                    <li className="page-item">
                      <a href="#" className="page-link">Previous</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">1</a>
                    </li>
                    <li className="page-item active">
                      <a className="page-link" href="#" aria-current="page">2</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">3</a>
                    </li>
                    <li className="page-item">
                      <a className="page-link" href="#">Next</a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="banner-text">
                <h1 className="banner-title">{t("orderPage.bannerTitle")}</h1>
                <p className="banner-subtitle">{t("orderPage.bannerSubtitle")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="page-container">
          <div className="login-required-card">
            <i className="fas fa-lock login-icon"></i>
            <h2 className="login-title">{t("orderPage.loginRequired")}</h2>
            <p className="login-description">
              {t("orderPage.loginDescription")}
            </p>
            <div className="login-buttons">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-arrow-right"></i>
                {t("orderPage.backToSearch")}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/auth')}
              >
                <i className="fas fa-sign-in-alt"></i>
                {t("orderPage.login")}
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
        <div className="banner-container">
          <div className="banner-content">
            <div className="banner-pagination">
              <nav aria-label="Order steps">
                <ul className="pagination pagination-sm mb-0">
                  <li className="page-item">
                    <a href="#" className="page-link">Previous</a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">1</a>
                  </li>
                  <li className="page-item active">
                    <a className="page-link" href="#" aria-current="page">2</a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">3</a>
                  </li>
                  <li className="page-item">
                    <a className="page-link" href="#">Next</a>
                  </li>
                </ul>
              </nav>
            </div>
            <div className="banner-text">
              <h1 className="banner-title">{t("orderPage.bannerTitle")}</h1>
              <p className="banner-subtitle">{t("orderPage.bannerSubtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Service Information Card */}
        <div className="service-card">
          <div className="service-card-header">
            <h3 className="service-title">{service.title || service.name || t("orderPage.selectedService")}</h3>
            {service.description && (
              <p className="service-description">{service.description}</p>
            )}
          </div>
          <div className="service-info">
            {service.provider && (
              <div className="info-item">
                <i className="fas fa-user info-icon"></i>
                <div className="info-content">
                  <div className="info-label">{t("orderPage.provider")}</div>
                  <div className="info-value">
                    {service.provider.first_name && service.provider.last_name 
                      ? `${service.provider.first_name} ${service.provider.last_name}`
                      : service.provider.username || t("orderPage.serviceProvider")}
                  </div>
                </div>
              </div>
            )}
            {service.price && (
              <div className="info-item">
                <i className="fas fa-money-bill-wave info-icon"></i>
                <div className="info-content">
                  <div className="info-label">{t("orderPage.suggestedPrice")}</div>
                  <div className="info-value">{service.price} {t("orderPage.currency")}</div>
                </div>
              </div>
            )}
            {service.distance_km && (
              <div className="info-item">
                <i className="fas fa-map-marker-alt info-icon"></i>
                <div className="info-content">
                  <div className="info-label">{t("orderPage.distance")}</div>
                  <div className="info-value">{service.distance_km.toFixed(1)} {t("orderPage.km")}</div>
                </div>
              </div>
            )}
            {service.address && (
              <div className="info-item">
                <i className="fas fa-location-dot info-icon"></i>
                <div className="info-content">
                  <div className="info-label">{t("orderPage.address")}</div>
                  <div className="info-value">{service.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            {successMessage}
          </div>
        )}
        
        {errors.submit && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i>
            {errors.submit}
          </div>
        )}

        {/* Order Form */}
        <div className="order-form">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-user"></i>
                {t("orderPage.customerInfo")}
              </h3>
              
              <div className="form-row">
                  <div className="form-group">
                  <label className="form-label">{t("orderPage.name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.name || user?.username || ''}
                      disabled
                    />
                  </div>
                  <div className="form-group">
                  <label className="form-label">{t("orderPage.email")}</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || ''}
                      disabled
                    />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-edit"></i>
                {t("orderPage.orderDetails")}
              </h3>
              
              <div className="form-group">
                <label className="form-label">{t("orderPage.orderDescription")} *</label>
                <textarea
                  name="description"
                  className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder={t("orderPage.descriptionPlaceholder")}
                  required
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
              </div>

              <div className="form-row">
                  <div className="form-group">
                  <label className="form-label">{t("orderPage.offeredPrice")} ({t("orderPage.currency")}) *</label>
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
                
                  <div className="form-group">
                  <label className="form-label">{t("orderPage.serviceDate")} *</label>
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

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/location')}
                disabled={isLoading}
              >
                <i className="fas fa-arrow-right"></i>
                {t("orderPage.backToSearch")}
              </button>
              <div className="form-actions-right">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => window.print()}
                  disabled={isLoading}
                >
                  <i className="fas fa-print"></i>
                  {t("orderPage.printOrder")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="loading-spinner"></span>
                      {t("orderPage.sending")}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i>
                      {t("orderPage.confirmOrder")}
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
