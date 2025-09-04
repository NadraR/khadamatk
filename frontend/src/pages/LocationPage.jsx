// src/pages/LocationPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  Box, Typography, CircularProgress, Chip, Button, List, ListItem, Paper,
  FormControl, InputLabel, Select, MenuItem, Container, IconButton, Card, CardContent
} from "@mui/material";
import { LocationOn as LocationIcon, Directions as DirectionsIcon, Refresh as RefreshIcon, Search as SearchIcon } from "@mui/icons-material";
import { locationService } from '../services/LocationService';
import LocationPicker from '../components/LocationPicker';
import Navbar from '../components/Navbar';
import "bootstrap/dist/css/bootstrap.min.css";

export default function LocationPage() {
  // الموقع المختار
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // نتائج الخدمات
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // نوع الخدمة المختار وقائمة الخدمات
  const [selectedService, setSelectedService] = useState("");
  const [servicesList, setServicesList] = useState([]);

  // فلاتر إضافية
  const [filters, setFilters] = useState({
    maxDistance: 10,
    minRating: 0,
    maxPrice: 1000
  });

  // جلب أنواع الخدمات
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseURL}/api/services/types/`);
        if (response.ok) {
          const data = await response.json();
          setServicesList(data);
        }
      } catch (err) {
        console.error("فشل في تحميل أنواع الخدمات", err);
      }
    };
    fetchServiceTypes();
  }, []);

  // جلب آخر موقع محفوظ
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const result = await locationService.getLatestLocation();
        if (result.success && result.data) {
          const locationData = result.data;
          if (locationData.lat && locationData.lng) {
            setSelectedLocation({
              lat: locationData.lat,
              lng: locationData.lng,
              address: locationData.address
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUserLocation();
  }, []);

  // استدعاء البحث عن الخدمات القريبة
  const fetchNearbyServices = useCallback(async (location) => {
    if (!location || !selectedService) return;
    try {
      setLoading(true);
      const result = await locationService.searchNearbyLocations(
        location.lat,
        location.lng,
        10,
        20
      );
      if (result.success) {
        setResults(result.data || []);
        setError(null);
      } else {
        setError(result.error || "فشل في تحميل الخدمات القريبة");
      }
    } catch (err) {
      setError("فشل في تحميل الخدمات القريبة");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  // تحديث البحث عند تغيير الموقع أو الخدمة
  useEffect(() => {
    if (selectedLocation && selectedService) {
      fetchNearbyServices(selectedLocation);
    }
  }, [selectedLocation, selectedService, fetchNearbyServices]);

  const handleRefresh = () => {
    if (selectedLocation) fetchNearbyServices(selectedLocation);
  };

  const getDirectionsUrl = (service) => {
    const lat = service.lat || service.location_lat;
    const lng = service.lng || service.location_lng;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  // البحث عن المدن
  const handleCitySearch = async (query) => {
    setCitySearch(query);
    if (query.length > 2 && window.google && window.google.maps) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: query }, (results, status) => {
          if (status === 'OK' && results) {
            const suggestions = results.slice(0, 5).map(result => ({
              address: result.formatted_address,
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng()
              }
            }));
            setSearchSuggestions(suggestions);
          } else {
            setSearchSuggestions([]);
          }
        });
      } catch (error) {
        console.error('Error searching cities:', error);
        setSearchSuggestions([]);
      }
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleCitySelect = (suggestion) => {
    setCitySearch(suggestion.address);
    setSelectedLocation(suggestion.location);
    setSearchSuggestions([]);
  };

  // تطبيق الفلاتر
  const applyFilters = (services) => {
    return services.filter(service => {
      const distance = service.distance_km || 0;
      const rating = service.rating || 0;
      const price = service.price || 0;
      
      return distance <= filters.maxDistance && 
             rating >= filters.minRating && 
             price <= filters.maxPrice;
    });
  };

  return (
    <div style={{ background: '#f9fbff', minHeight: '100vh' }}>
      <Navbar />
      
      {/* Header Section */}
      <div className="container-fluid py-4" style={{ background: 'linear-gradient(135deg, #0077ff, #4da6ff)' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="text-white mb-2" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                ابحث عن مزودي الخدمة
              </h1>
              <p className="text-white-50 mb-0" style={{ fontSize: '1.1rem' }}>
                اختر موقعك وابحث عن أفضل مزودي الخدمة في منطقتك
              </p>
            </div>
            <div className="col-md-4 text-end">
              <div className="d-flex align-items-center justify-content-end">
                <div className="me-3">
                  <div className="text-white fw-bold">الخطوة 1 من 3</div>
                  <div className="text-white-50 small">اختيار الموقع والخدمة</div>
                </div>
                <div className="step-indicator">
                  <div className="step active">1</div>
                  <div className="step">2</div>
                  <div className="step">3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <div className="row g-4">
          
          {/* Left Column - Search and Filters */}
          <div className="col-lg-4">
            
            {/* City Search Card */}
            <Card className="mb-4" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
              <CardContent className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <LocationIcon className="text-primary me-2" />
                  <h5 className="mb-0 fw-bold">موقعك</h5>
                </div>
                
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="ابحث عن مدينتك أو عنوانك..."
                    value={citySearch}
                    onChange={(e) => handleCitySearch(e.target.value)}
                    style={{ borderRadius: '12px', border: '2px solid #e5e7eb' }}
                  />
                  
                  {searchSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {searchSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="suggestion-item"
                          onClick={() => handleCitySelect(suggestion)}
                        >
                          <LocationIcon className="me-2 text-muted" />
                          {suggestion.address}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedLocation && (
                  <div className="mt-3 p-3 bg-light rounded-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle p-2 me-3">
                        <i className="bi bi-check text-white"></i>
                      </div>
                      <div>
                        <div className="fw-bold text-success">تم تحديد الموقع بنجاح!</div>
                        <div className="text-muted small">{citySearch}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Selection Card */}
            <Card className="mb-4" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
              <CardContent className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <SearchIcon className="text-primary me-2" />
                  <h5 className="mb-0 fw-bold">نوع الخدمة</h5>
                </div>
                
                <FormControl fullWidth>
                  <InputLabel>اختر نوع الخدمة</InputLabel>
                  <Select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    label="اختر نوع الخدمة"
                    style={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="">
                      <em>اختر نوع الخدمة</em>
                    </MenuItem>
                    {servicesList.map(service => (
                      <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedService && (
                  <div className="mt-3 p-3 bg-light rounded-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded-circle p-2 me-3">
                        <i className="bi bi-check text-white"></i>
                      </div>
                      <div>
                        <div className="fw-bold text-success">تم اختيار الخدمة!</div>
                        <div className="text-muted small">
                          {servicesList.find(s => s.id === selectedService)?.name}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters Card */}
            <Card className="mb-4" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
              <CardContent className="p-4">
                <h5 className="fw-bold mb-3">الفلاتر</h5>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">المسافة القصوى (كم)</label>
                  <input
                    type="range"
                    className="form-range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                  />
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">1 كم</small>
                    <small className="fw-bold text-primary">{filters.maxDistance} كم</small>
                    <small className="text-muted">50 كم</small>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">الحد الأدنى للتقييم</label>
                  <input
                    type="range"
                    className="form-range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                  />
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">0 ⭐</small>
                    <small className="fw-bold text-primary">{filters.minRating} ⭐</small>
                    <small className="text-muted">5 ⭐</small>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Button */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!selectedLocation || !selectedService || loading}
              onClick={handleRefresh}
              style={{
                borderRadius: '12px',
                padding: '12px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #0077ff, #4da6ff)',
                border: 'none'
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} className="me-2" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <SearchIcon className="me-2" />
                  ابحث عن مزودي الخدمة
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Results and Map */}
          <div className="col-lg-8">
            
            {/* Results Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">أقرب مزودي الخدمة</h4>
                <p className="text-muted mb-0">
                  {results.length > 0 ? `تم العثور على ${results.length} مزود خدمة` : 'لم يتم العثور على نتائج'}
                </p>
              </div>
              <IconButton onClick={handleRefresh} disabled={loading || !selectedService}>
                <RefreshIcon />
              </IconButton>
            </div>

            {/* Results List */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <CircularProgress size={40} />
                <div className="mt-3">جارٍ تحميل الخدمات...</div>
              </div>
            ) : results.length > 0 ? (
              <div className="row g-3">
                {applyFilters(results).map(service => (
                  <div key={service.id} className="col-12">
                    <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <CardContent className="p-4">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h6 className="fw-bold mb-2 text-primary">
                              {service.user?.first_name && service.user?.last_name 
                                ? `${service.user.first_name} ${service.user.last_name}`
                                : service.user?.username || 'مزود خدمة'}
                            </h6>
                            
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {service.distance_km != null && (
                                <Chip 
                                  label={`${service.distance_km.toFixed(1)} كم`} 
                                  size="small" 
                                  variant="outlined" 
                                  color="primary"
                                />
                              )}
                              {service.rating && (
                                <Chip 
                                  label={`${service.rating} ⭐`} 
                                  size="small" 
                                  variant="outlined" 
                                  color="secondary"
                                />
                              )}
                            </div>
                            
                            {service.address && (
                              <div className="d-flex align-items-center text-muted">
                                <LocationIcon className="me-1" style={{ fontSize: '16px' }} />
                                <small>{service.address}</small>
                              </div>
                            )}
                          </div>
                          
                          <div className="col-md-4 text-end">
                            <Button
                              variant="outlined"
                              startIcon={<DirectionsIcon />}
                              href={getDirectionsUrl(service)}
                              target="_blank"
                              rel="noopener"
                              style={{ borderRadius: '8px' }}
                            >
                              عرض الاتجاهات
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="text-muted">
                  <SearchIcon style={{ fontSize: '48px', opacity: 0.3 }} />
                  <div className="mt-3">لا توجد خدمات قريبة ضمن النطاق المحدد</div>
                  <small>جرب تغيير الفلاتر أو البحث في منطقة أخرى</small>
                </div>
              </div>
            )}

            {/* Map Section */}
            <div className="mt-4">
              <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
                <CardContent className="p-0">
                  <div className="p-3 border-bottom">
                    <h6 className="fw-bold mb-0">الخريطة التفاعلية</h6>
                    <small className="text-muted">انقر على الخريطة لتحديد موقعك</small>
                  </div>
                  <LocationPicker 
                    onLocationSelect={(loc) => setSelectedLocation(loc)}
                    height={400}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>

      {/* Custom Styles */}
      <style jsx="true">{`
        .step-indicator {
          display: flex;
          gap: 8px;
        }
        .step {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          background: rgba(255,255,255,0.3);
          color: white;
        }
        .step.active {
          background: white;
          color: #0077ff;
        }
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }
        .suggestion-item {
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
        }
        .suggestion-item:hover {
          background: #f9fafb;
        }
        .suggestion-item:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
