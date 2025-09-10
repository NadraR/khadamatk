// src/pages/LocationPage.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import RatingService from '../services/RatingService';
import RatingStars from '../components/RatingStars';
import LocationPicker from '../components/LocationPicker';
import Navbar from '../components/Navbar';
import { useTranslation } from '../hooks/useTranslation';
import "bootstrap/dist/css/bootstrap.min.css";

export default function LocationPage() {
  const { t } = useTranslation();
  
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
  
  // Rating data
  const [providersRatings, setProvidersRatings] = useState({});
  const [sortByRating, setSortByRating] = useState(false);

  // Helper function to build location address
  const buildLocationAddress = (location) => {
    if (!location) return '';
    
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.city && location.city !== location.address) parts.push(location.city);
    if (location.neighborhood && location.neighborhood !== location.city) parts.push(location.neighborhood);
    
    return parts.join(', ') || `${location.lat?.toFixed(6)}, ${location.lng?.toFixed(6)}`;
  };

  // Load ratings for providers
  const loadProviderRatings = useCallback(async (providers) => {
    // Check if user is authenticated before trying to load ratings
    const accessToken = localStorage.getItem('access');
    if (!accessToken) {
      console.log('User not authenticated, skipping ratings load');
      return;
    }

    const ratingsMap = {};
    for (const provider of providers) {
      try {
        // Get user/provider ID for ratings
        const providerId = provider.user?.id || provider.worker?.id || provider.provider?.id || provider.provider_id || provider.id;
        if (providerId && !providersRatings[providerId]) {
          const result = await RatingService.getProviderRating(providerId);
          if (result.success) {
            ratingsMap[providerId] = result.data;
          }
        }
      } catch (error) {
        // Don't log 401 errors as they're expected for unauthenticated users
        if (error.response?.status !== 401) {
        console.error('Error loading provider rating:', error);
        }
      }
    }
    
    if (Object.keys(ratingsMap).length > 0) {
      setProvidersRatings(prev => ({ ...prev, ...ratingsMap }));
    }
  }, [providersRatings]);

  // Filter and sort results by rating
  const filteredAndSortedResults = useMemo(() => {
    let filtered = results.filter(service => {
      // Get user/provider ID for ratings
      const providerId = service.user?.id || service.worker?.id || service.provider?.id || service.provider_id || service.id;
      const rating = providersRatings[providerId];
      const avgRating = rating?.average_rating || 0;
      
      // Apply rating filter
      if (filters.minRating > 0 && avgRating < filters.minRating) {
        return false;
      }
      
      return true;
    });

    // Sort by rating if enabled
    if (sortByRating) {
      filtered = filtered.sort((a, b) => {
        const providerIdA = a.user?.id || a.worker?.id || a.provider?.id || a.provider_id || a.id;
        const providerIdB = b.user?.id || b.worker?.id || b.provider?.id || b.provider_id || b.id;
        const ratingA = providersRatings[providerIdA]?.average_rating || 0;
        const ratingB = providersRatings[providerIdB]?.average_rating || 0;
        return ratingB - ratingA; // Sort descending (highest first)
      });
    }

    return filtered;
  }, [results, providersRatings, filters.minRating, sortByRating]);

  // الدوال الجديدة للزرين
  const handleShowProviderProfile = (service) => {
    // الانتقال إلى صفحة الملف الشخصي لمزود الخدمة
    const providerId = service.user?.id || service.worker?.id || service.provider?.id || service.provider_id || service.id;
    if (providerId) {
      window.open(`/provider/${providerId}`, '_blank');
    } else {
      console.error('لا يوجد معرف للمزود', service);
      setError('لا يمكن عرض الملف الشخصي - المعرف غير متوفر');
    }
  };

  const handleBookService = async (service) => {
    const serviceId = service.id;
    if (serviceId) {
      // ✅ Store service data
      localStorage.setItem('selectedService', JSON.stringify(service));

      // ✅ Store location data (if available)
      if (selectedLocation) {
        localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation));
      }

      // (اختياري) حفظ الموقع في السيرفر إذا المستخدم مسجل
      if (selectedLocation) {
        const accessToken = localStorage.getItem('access');
        if (accessToken && accessToken.trim() !== '' && accessToken !== 'null' && accessToken !== 'undefined') {
          try {
            const { locationService } = await import('../services/LocationService');
            await locationService.saveLocation({
              lat: selectedLocation.lat,
              lng: selectedLocation.lng,
              address: buildLocationAddress(selectedLocation) || citySearch,
              city: selectedLocation.city || '',
              neighborhood: selectedLocation.neighborhood || '',
              location_type: 'service_booking',
              name: 'موقع حجز الخدمة'
            });
          } catch (error) {
            console.error('[DEBUG] LocationPage: Error saving location:', error);
          }
        } else {
          console.log('[DEBUG] LocationPage: User not authenticated, skipping location save');
        }
      }

      // ✅ Navigate to order page
      window.location.href = '/order';
    } else {
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
          const providers = result.data || [];
          setResults(providers);
          setError(null);
          console.log('Search successful, found', providers.length, 'results');
          // console.log('Sample provider data:', providers[0]); // Debug provider structure
          // console.log('All providers data:', providers); // Debug all providers
          
          // Load ratings for providers
          if (providers.length > 0) {
            loadProviderRatings(providers);
          }
          
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
  }, [selectedService, customService, isSearching, loadProviderRatings]);

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
  }, [selectedLocation, selectedService, serviceData, isSearching, isInitialized, fetchNearbyServices]);

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

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="sortByRating"
                      checked={sortByRating}
                      onChange={(e) => setSortByRating(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold" htmlFor="sortByRating">
                      ترتيب حسب التقييم (الأعلى أولاً)
                    </label>
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
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">أقرب مزودي الخدمة</h4>
                <p className="text-muted mb-0">
                  {filteredAndSortedResults.length > 0 ? `تم العثور على ${filteredAndSortedResults.length} مزود خدمة` : 'لم يتم العثور على نتائج'}
                </p>
              </div>
              <IconButton onClick={handleRefresh} disabled={loading || !selectedService}>
                <RefreshIcon />
              </IconButton>
            </div>

            {/* Results List */}
            {loading ? (
              <div className="text-center py-5">
                <CircularProgress size={40} />
                <div className="mt-3">جارٍ تحميل الخدمات...</div>
              </div>
            ) : filteredAndSortedResults.length > 0 ? (
              <div className="row g-3">
                {filteredAndSortedResults.map(service => (
                  <div key={service.id} className="col-12">
                    <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <CardContent className="p-4">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <h6 className="fw-bold mb-2 text-primary">
                              {(() => {
                                // Debug: Log the service data to see what's available
                                // console.log('Service data for name display:', service);
                                // console.log('User object:', service.user);
                                
                                // Try different ways to get user/provider name
                                // Based on console logs, some users have empty first_name/last_name
                                if (service.user?.first_name && service.user?.last_name) {
                                  return `${service.user.first_name} ${service.user.last_name}`;
                                }
                                if (service.user?.first_name) {
                                  return service.user.first_name;
                                }
                                if (service.user?.last_name) {
                                  return service.user.last_name;
                                }
                                if (service.user?.username) {
                                  return service.user.username;
                                }
                                if (service.user?.name) {
                                  return service.user.name;
                                }
                                if (service.worker?.first_name && service.worker?.last_name) {
                                  return `${service.worker.first_name} ${service.worker.last_name}`;
                                }
                                if (service.worker?.name) {
                                  return service.worker.name;
                                }
                                if (service.worker?.username) {
                                  return service.worker.username;
                                }
                                if (service.first_name && service.last_name) {
                                  return `${service.first_name} ${service.last_name}`;
                                }
                                if (service.name) {
                                  return service.name;
                                }
                                if (service.username) {
                                  return service.username;
                                }
                                if (service.worker_name) {
                                  return service.worker_name;
                                }
                                if (service.worker_username) {
                                  return service.worker_username;
                                }
                                if (service.provider?.first_name && service.provider?.last_name) {
                                  return `${service.provider.first_name} ${service.provider.last_name}`;
                                }
                                if (service.provider?.name) {
                                  return service.provider.name;
                                }
                                if (service.provider?.username) {
                                  return service.provider.username;
                                }
                                if (service.provider_username) {
                                  return service.provider_username;
                                }
                                if (service.title) {
                                  return service.title;
                                }
                                return 'مزود خدمة';
                              })()}
                            </h6>
                            
                            {/* Rating Display */}
                            {(() => {
                              // Get user/provider ID for ratings
                              const providerId = service.user?.id || service.worker?.id || service.provider?.id || service.provider_id || service.id;
                              const rating = providersRatings[providerId];
                              
                              // Use rating from API if available, otherwise use rating from service data
                              const displayRating = rating?.average_rating || service.user?.rating || service.rating;
                              const totalRatings = rating?.total_ratings || 0;
                              
                              return displayRating > 0 && (
                                <div className="d-flex align-items-center mb-2">
                                  <RatingStars 
                                    rating={displayRating} 
                                    size="small" 
                                    readOnly={true}
                                  />
                                  <span className="ms-2 text-muted small">
                                    ({displayRating.toFixed(1)} {totalRatings > 0 ? `- ${totalRatings} تقييم` : ''})
                                  </span>
                                </div>
                              );
                            })()}
                            
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
                              {service.user?.price > 0 && (
                                <Chip 
                                  label={`${service.user.price} جنيه/ساعة`} 
                                  size="small" 
                                  variant="outlined" 
                                  color="success"
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
                    <small className="text-muted">انقر على الخريطة لتحديد موقعك</small>
                  </div>
                  <LocationPicker 
                    onLocationSelect={async (loc) => {
                      setSelectedLocation(loc);
                      
                      // Save location data if user is authenticated
                      if (loc && loc.lat && loc.lng) {
                        const accessToken = localStorage.getItem('access');
                        if (accessToken && accessToken.trim() !== '' && accessToken !== 'null' && accessToken !== 'undefined') {
                          try {
                            const { locationService } = await import('../services/LocationService');
                            const locationData = {
                              lat: loc.lat,
                              lng: loc.lng,
                              address: buildLocationAddress(loc) || citySearch,
                              city: loc.city || '',
                              neighborhood: loc.neighborhood || '',
                              location_type: 'map_selection',
                              name: 'موقع محدد على الخريطة'
                            };
                            
                            const result = await locationService.saveLocation(locationData);
                            if (result.success) {
                              console.log('[DEBUG] LocationPage: Map location saved successfully');
                            }
                          } catch (error) {
                            console.error('[DEBUG] LocationPage: Error saving map location:', error);
                          }
                        } else {
                          console.log('[DEBUG] LocationPage: User not authenticated, skipping map location save');
                        }
                      }
                    }}
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
