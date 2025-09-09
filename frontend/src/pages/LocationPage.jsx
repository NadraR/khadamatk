// src/pages/LocationPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  Box, Typography, CircularProgress, Chip, Button, List, ListItem, Paper,
  FormControl, InputLabel, Select, MenuItem, Container, IconButton, Card, CardContent
} from "@mui/material";
import { 
  LocationOn as LocationIcon, 
  Refresh as RefreshIcon, 
  Search as SearchIcon,
  Person as PersonIcon,
  EventAvailable as EventIcon
} from "@mui/icons-material";
import { locationService } from '../services/LocationService';
import LocationPicker from '../components/LocationPicker';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import "bootstrap/dist/css/bootstrap.min.css";
import './LocationPage.css';

export default function LocationPage() {
  const { t } = useTranslation();
  
  // الموقع المختار
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [citySearch, setCitySearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  
  // تفاصيل الموقع الإضافية للعملاء
  const [locationDetails, setLocationDetails] = useState({
    building_number: '',
    apartment_number: '',
    floor_number: '',
    landmark: '',
    additional_details: ''
  });

  // نتائج الخدمات
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // نوع الخدمة المختار وقائمة الخدمات
  const [selectedService, setSelectedService] = useState("");
  const [servicesList, setServicesList] = useState([]);
  const [serviceData, setServiceData] = useState(null);
  const [customService, setCustomService] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const hasSearchedRef = useRef(false);
  const searchTimeoutRef = useRef(null);

  // فلاتر إضافية
  const [filters, setFilters] = useState({
    maxDistance: 10,
    minRating: 0,
    maxPrice: 1000
  });

  // الدوال الجديدة للزرين
  const handleShowProviderProfile = (service) => {
    // الانتقال إلى صفحة الملف الشخصي لمزود الخدمة
    const providerId = service.provider?.id || service.provider_id;
    if (providerId) {
      window.open(`/provider/${providerId}`, '_blank');
    } else {
      console.error('لا يوجد معرف للمزود', service);
      setError('لا يمكن عرض الملف الشخصي - المعرف غير متوفر');
    }
  };

  const handleBookService = (service) => {
    // الانتقال إلى صفحة الطلب
    const serviceId = service.id;
    if (serviceId) {
      // Store service data and location details in localStorage for the order page
      const serviceData = {
        ...service,
        selectedLocation: selectedLocation,
        locationDetails: locationDetails
      };
      localStorage.setItem('selectedService', JSON.stringify(serviceData));
      // Navigate to order page
      window.location.href = '/order';
    } else {
      console.error('لا يوجد معرف للخدمة', service);
      setError('لا يمكن حجز الخدمة - المعرف غير متوفر');
    }
  };

  // جلب أنواع الخدمات
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        console.log('Fetching service types...');
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseURL}/api/services/types/`);
        if (response.ok) {
          const data = await response.json();
          setServicesList(data);
          console.log('Service types loaded:', data.length, 'services');
        } else {
          console.error('Failed to fetch service types:', response.status);
          setError('فشل في تحميل أنواع الخدمات');
        }
      } catch (err) {
        console.error("فشل في تحميل أنواع الخدمات", err);
        setError('خطأ في الاتصال بالخادم');
      }
    };
    fetchServiceTypes();
  }, []);

  // تحميل الخدمة المختارة من localStorage
  useEffect(() => {
    const savedService = localStorage.getItem('selectedService');
    if (savedService && servicesList.length > 0) {
      try {
        const serviceData = JSON.parse(savedService);
        console.log('Loaded service from localStorage:', serviceData);
        
        // Find matching service in servicesList by name or searchTerm
        const searchTerm = serviceData.searchTerm || serviceData.name?.ar || serviceData.name?.en || '';
        console.log('Searching for service:', searchTerm);
        console.log('Available services:', servicesList);
        
        // First try to find by exact ID match (if serviceData.id is numeric)
        let matchingService = null;
        if (typeof serviceData.id === 'number' || !isNaN(Number(serviceData.id))) {
          matchingService = servicesList.find(service => 
            service.id === Number(serviceData.id)
          );
        }
        
        // If no ID match, try to find by exact name match
        if (!matchingService) {
          matchingService = servicesList.find(service => 
            service.name === searchTerm || 
            service.name?.toLowerCase() === searchTerm.toLowerCase()
          );
        }
        
        // If no exact match, try partial matching
        if (!matchingService) {
          matchingService = servicesList.find(service => 
            service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            searchTerm.toLowerCase().includes(service.name?.toLowerCase())
          );
        }
        
        // If still no match, try to match by common service names
        if (!matchingService) {
          const serviceNameMap = {
            'cleaning': 'تنظيف',
            'assembly': 'تركيب',
            'moving': 'نقل',
            'painting': 'دهان',
            'repairs': 'إصلاح',
            'plumbing': 'سباكة',
            'electrical': 'كهرباء',
            'carpentry': 'نجارة'
          };
          
          // Handle both string and numeric IDs
          const serviceId = typeof serviceData.id === 'string' ? serviceData.id : serviceData.id?.toString();
          const mappedName = serviceNameMap[serviceId?.toLowerCase()];
          if (mappedName) {
            matchingService = servicesList.find(service => 
              service.name?.toLowerCase().includes(mappedName.toLowerCase()) ||
              mappedName.toLowerCase().includes(service.name?.toLowerCase())
            );
          }
        }
        
        // If still no match, try to find by the original service ID from localStorage
        if (!matchingService && serviceData.id) {
          // Try to find a service that might match the original ID
          const serviceId = typeof serviceData.id === 'string' ? serviceData.id : serviceData.id.toString();
          matchingService = servicesList.find(service => 
            service.id.toString() === serviceId ||
            service.name?.toLowerCase().includes(serviceId.toLowerCase())
          );
        }
        
        if (matchingService) {
          // Set the selected service ID for the Select component
          setSelectedService(matchingService.id.toString());
          console.log('Matched service:', matchingService);
      } else {
          // If no exact match, create a custom service option
          setSelectedService('custom');
          setCustomService({
            id: 'custom',
            name: searchTerm,
            originalData: serviceData
          });
          console.log('Created custom service for:', searchTerm);
        }
        
        // Store the full service data for later use
        setServiceData(serviceData);
        
      } catch (error) {
        console.error('Error parsing saved service:', error);
        setSelectedService(''); // Reset to avoid MUI error
        setError('خطأ في تحميل الخدمة المحفوظة');
      }
    }
  }, [servicesList]); // Only depend on servicesList

  // استدعاء البحث عن الخدمات القريبة
  const fetchNearbyServices = useCallback(async (location, serviceTerm = null) => {
    if (!location || isSearching) {
      console.log('Skipping search - no location or already searching');
      return;
    }

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce the search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      // Use serviceTerm if provided, otherwise use selectedService
      let searchTerm = serviceTerm || selectedService;
      
      // If selectedService is 'custom', use the custom service name
      if (selectedService === 'custom' && customService) {
        searchTerm = customService.name;
      }
      
      if (!searchTerm) {
        console.log('Skipping search - no search term');
        return;
      }
      
      try {
        setIsSearching(true);
        setLoading(true);
        setError(null);
        
        console.log('Starting search for:', searchTerm, 'at location:', location);
        
        // Get the service type ID for the API
        let serviceTypeId = null;
        if (selectedService && selectedService !== 'custom') {
          serviceTypeId = selectedService;
        } else if (customService && customService.originalData?.id) {
          serviceTypeId = customService.originalData.id;
        }
        
        console.log('Searching with service type ID:', serviceTypeId);
        
        const result = await locationService.searchNearbyLocations(
          location.lat,
          location.lng,
          10,
          serviceTypeId
        );

        if (result.success) {
          setResults(result.data || []);
          setError(null);
          console.log('Search successful, found', result.data?.length || 0, 'results');
          
          if (result.data?.length === 0) {
            setError('لم يتم العثور على مزودي خدمات في هذه المنطقة. جرب البحث في منطقة أخرى أو غير نوع الخدمة.');
          } else {
            setError(null); // Clear any previous errors
          }
        } else {
          setError(result.error || "فشل في تحميل الخدمات القريبة");
          console.error('Search failed:', result.error);
        }
      } catch (err) {
        setError("فشل في تحميل الخدمات القريبة");
        console.error('Search error:', err);
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    }, 300);
  }, [selectedService, customService, isSearching]);

  // جلب آخر موقع محفوظ
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        console.log('Fetching user location...');
        const result = await locationService.getLatestLocation();
        if (result.success && result.data) {
          const locationData = result.data;
          if (locationData.lat && locationData.lng) {
            setSelectedLocation({
              lat: locationData.lat,
              lng: locationData.lng,
              address: locationData.address
            });
            console.log('User location loaded:', locationData.address);
          }
        } else {
          console.log('No saved location found');
        }
      } catch (err) {
        console.error('Error fetching user location:', err);
        // Don't set error for location fetch as it's optional
      } finally {
        setIsInitialized(true);
      }
    };
    fetchUserLocation();
  }, []);

  // Auto-search when both location and service are available (only once)
  useEffect(() => {
    if (selectedLocation && selectedService && serviceData && !isSearching && isInitialized && !hasSearchedRef.current) {
      const searchTerm = serviceData.searchTerm || serviceData.name?.ar || serviceData.name?.en || '';
      if (searchTerm) {
        console.log('Auto-triggering search with:', searchTerm);
        hasSearchedRef.current = true; // Mark as searched to prevent re-triggering
        fetchNearbyServices(selectedLocation, searchTerm);
      }
    }
  }, [selectedLocation, selectedService, serviceData, isSearching, isInitialized]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    if (selectedLocation && !isSearching) {
      console.log('Manual refresh triggered');
      hasSearchedRef.current = false; // Reset search flag for manual refresh
      fetchNearbyServices(selectedLocation);
    } else {
      console.log('Refresh skipped - no location or already searching');
    }
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

  // التعامل مع تغيير تفاصيل الموقع
  const handleLocationDetailsChange = (e) => {
    const { name, value } = e.target;
    setLocationDetails(prev => ({
      ...prev,
      [name]: value
    }));
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

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div style={{ background: '#f9fbff', minHeight: '100vh' }}>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <CircularProgress size={60} />
            <div className="mt-3">جارٍ تحميل الصفحة...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error fallback
  if (error && !selectedLocation && !selectedService) {
    return (
      <div style={{ background: '#f9fbff', minHeight: '100vh' }}>
        <Navbar />
        <div className="container py-5">
          <div className="text-center">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">حدث خطأ!</h4>
              <p>{error}</p>
              <hr />
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                إعادة تحميل الصفحة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f9fbff', minHeight: '100vh' }}>
      <Navbar />
      
      {/* Header Section */}
      <div className="feature-section location-banner">
        <div className="feature-content">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-7">
                <div className="header-content">
                  <h1 className="header-title">
                    <SearchIcon className="header-icon" />
                    ابحث عن مزودي الخدمة
                  </h1>
                  <p className="header-subtitle">
                    حدد موقعك واختر الخدمة المناسبة لك من أفضل مقدمي الخدمات
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="step-indicator">
                  <div className="step-text">
                    <span className="step-number">الخطوة 1 من 2</span>
                    <span className="step-description">تحديد الموقع والخدمة</span>
                  </div>
                  <div className="step-circles">
                    <div className="step-circle active">
                      <span>1</span>
                    </div>
                    <div className="step-circle">
                      <span>2</span>
                    </div>
                  </div>
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
                        <div className="fw-bold text-success">أو قم بتحديد الموقع على الخريطة</div>
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
                    {customService && (
                      <MenuItem value="custom" style={{ backgroundColor: '#e3f2fd' }}>
                        <em>{customService.name} ({t('custom_service')})</em>
                      </MenuItem>
                    )}
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
                          {selectedService === 'custom' && customService ? (
                            <>
                              <div>{customService.name} ({t('custom_service')})</div>
                              {customService.originalData?.price && <div className="text-primary fw-bold">{customService.originalData.price}</div>}
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                تم الاختيار من: {customService.originalData?.fromSearch ? 'البحث' : 'الصفحة الرئيسية'}
                              </div>
                            </>
                          ) : serviceData ? (
                            <>
                              <div>{serviceData.searchTerm || serviceData.name?.ar || serviceData.name?.en}</div>
                              {serviceData.price && <div className="text-primary fw-bold">{serviceData.price}</div>}
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                تم الاختيار من: {serviceData.fromSearch ? 'البحث' : 'الصفحة الرئيسية'}
                              </div>
                            </>
                          ) : (
                            servicesList.find(s => s.id.toString() === selectedService)?.name
                          )}
                        </div>
                      </div>
                    </div>
        </div>
      )}
              </CardContent>
            </Card>

            {/* Location Details Card */}
            <Card className="mb-4" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
              <CardContent className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <LocationIcon className="text-primary me-2" />
                  <h5 className="mb-0 fw-bold">تفاصيل الموقع</h5>
                </div>
                <p className="text-muted small mb-3">أضف تفاصيل إضافية لمساعدة مزود الخدمة في الوصول إليك</p>
                
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold">رقم العمارة</label>
                    <input
                      type="text"
                      name="building_number"
                      value={locationDetails.building_number}
                      onChange={handleLocationDetailsChange}
                      className="form-control"
                      placeholder="مثال: 15"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold">رقم الشقة</label>
                    <input
                      type="text"
                      name="apartment_number"
                      value={locationDetails.apartment_number}
                      onChange={handleLocationDetailsChange}
                      className="form-control"
                      placeholder="مثال: 3أ"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">الطابق</label>
                    <input
                      type="text"
                      name="floor_number"
                      value={locationDetails.floor_number}
                      onChange={handleLocationDetailsChange}
                      className="form-control"
                      placeholder="مثال: الثالث"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">معلم مميز</label>
                    <input
                      type="text"
                      name="landmark"
                      value={locationDetails.landmark}
                      onChange={handleLocationDetailsChange}
                      className="form-control"
                      placeholder="مثال: بجوار مدرسة الأمل، أمام محطة البنزين"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">تفاصيل إضافية</label>
                    <textarea
                      name="additional_details"
                      value={locationDetails.additional_details}
                      onChange={handleLocationDetailsChange}
                      className="form-control"
                      rows="2"
                      placeholder="أي تفاصيل أخرى تساعد في الوصول..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters Card */}
            <Card className="mb-4" style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
              <CardContent className="p-4">
                <h5 className="fw-bold mb-3">تصفية البحث</h5>
                
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
              disabled={!selectedLocation || !selectedService || loading || isSearching}
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
              {loading || isSearching ? (
                <>
                  <CircularProgress size={20} className="me-2" />
                  {isSearching ? 'جاري البحث...' : 'جاري التحميل...'}
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
            <div className="results-header mb-4">
              <div className="results-info">
                <h4 className="results-title">أقرب مزودي الخدمة</h4>
                <div className="results-count">
                  {loading ? (
                    <span className="loading-text">جاري البحث...</span>
                  ) : (
                    <span className={`count-badge ${results.length > 0 ? 'success' : 'empty'}`}>
                      {results.length > 0 ? `${results.length} مزود خدمة` : 'لا توجد نتائج'}
                    </span>
                  )}
                </div>
              </div>
              <button 
                className="refresh-btn"
                onClick={handleRefresh} 
                disabled={loading || !selectedService}
                title="تحديث النتائج"
              >
                <RefreshIcon />
              </button>
            </div>

            {/* Results List */}
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
                              {service.provider?.first_name && service.provider?.last_name 
                                ? `${service.provider.first_name} ${service.provider.last_name}`
                                : service.provider?.username || service.title || 'مزود خدمة'}
                            </h6>
                            
                            {service.title && (
                              <p className="text-muted mb-1 small">
                                <strong>الخدمة:</strong> {service.title}
                              </p>
                            )}
                            
                            {service.description && (
                              <p className="text-muted mb-1 small">
                                {service.description.length > 100 
                                  ? `${service.description.substring(0, 100)}...` 
                                  : service.description}
                              </p>
                            )}
                            
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

                            {(service.address || service.location_address) && (
                              <div className="d-flex align-items-center text-muted">
                                <LocationIcon className="me-1" style={{ fontSize: '16px' }} />
                                <small>{service.address || service.location_address}</small>
                              </div>
                            )}
                          </div>
                          
                          <div className="col-md-4 text-end">
                            <div className="d-flex flex-column gap-2">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PersonIcon />}
                                onClick={() => handleShowProviderProfile(service)}
                                style={{ 
                                  borderRadius: '8px',
                                  backgroundColor: '#0077ff',
                                  minWidth: '140px'
                                }}
                              >
                                عرض الملف الشخصي
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EventIcon />}
                                onClick={() => handleBookService(service)}
                                style={{ 
                                  borderRadius: '8px',
                                  borderColor: '#28a745',
                                  color: '#28a745',
                                  minWidth: '140px'
                                }}
                              >
                                حجز الخدمة
                              </Button>
                            </div>
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
                  <div className="mt-3">
                    {error ? error : 'لا توجد خدمات قريبة ضمن النطاق المحدد'}
                  </div>
                  <small>
                    {error ? 'جرب تغيير نوع الخدمة أو البحث في منطقة أخرى' : 'جرب تغيير الفلاتر أو البحث في منطقة أخرى'}
                  </small>
                </div>
              </div>
            )}

            {/* Map Section */}
            <div className="mt-4">
              <Card style={{ borderRadius: '16px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }}>
                <CardContent className="p-0">
                  <div className="p-3 border-bottom">
                    <h6 className="fw-bold mb-0">الخريطة التفاعلية</h6>
                    <small className="text-muted">انقر على الخريطة لتحديد موقعك أو ابحث عن مكان</small>
                  </div>
                  <LocationPicker 
                    onLocationSelect={(loc) => {
                      setSelectedLocation(loc);
                      // Auto-trigger search when location is selected
                      if (selectedService && !isSearching) {
                        hasSearchedRef.current = false;
                        fetchNearbyServices(loc);
                      }
                    }}
                    initialLocation={selectedLocation}
                    height={400}
                    showSaveButton={true}
                    showSearchBox={true}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>

    </div>
  );
}