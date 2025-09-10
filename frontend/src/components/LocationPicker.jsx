import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { locationService } from '../services/LocationService';
import { MapPin, Save, Crosshair, Navigation, Search, Loader2, AlertCircle } from 'lucide-react';
import { GOOGLE_MAPS_LIBRARIES, DEFAULT_CENTER } from '../constants/googleMaps';
import './LocationPicker.css';

export default function LocationPicker({ onLocationSelect, height = 500, initialLocation = null, showSaveButton = true, showSearchBox = true }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: 'ar',
    region: 'EG',
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [markerPosition, setMarkerPosition] = useState(initialLocation);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isManualSelection, setIsManualSelection] = useState(!!initialLocation);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentLocationAccuracy, setCurrentLocationAccuracy] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const geocoderRef = useRef(null);
  const watchIdRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastToastRef = useRef(null);
  const toastCooldownRef = useRef(0);
  const geolocationInProgressRef = useRef(false);

  // Smart toast function to prevent duplicates
  const showSmartToast = useCallback((message, type = 'info', options = {}) => {
    const now = Date.now();
    const cooldown = 2000; // 2 seconds cooldown
    
    // Check if same message was shown recently
    if (lastToastRef.current === message && (now - toastCooldownRef.current) < cooldown) {
      return; // Skip duplicate toast
    }
    
    lastToastRef.current = message;
    toastCooldownRef.current = now;
    
    const defaultOptions = {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    };
    
    toast[type](message, { ...defaultOptions, ...options });
  }, []);

  // التأكد من أن المكون لم يتم فصله قبل اكتمال العمليات غير المتزامنة
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      geolocationInProgressRef.current = false;
    };
  }, []);

  // Initialize geocoder
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
      
      // Suppress Google Maps warnings
      const originalWarn = console.warn;
      console.warn = function(...args) {
        const message = args[0];
        if (message && typeof message === 'string') {
          // Suppress marker deprecation warning
          if (message.includes('google.maps.Marker is deprecated')) {
            return;
          }
          // Suppress LoadScript performance warning
          if (message.includes('LoadScript has been reloaded unintentionally')) {
            return;
          }
        }
        originalWarn.apply(console, args);
      };
    }
  }, [isLoaded]);

  // Geocode location to get address
  const geocodeLocation = useCallback(async (location) => {
    if (!geocoderRef.current) return location;
    
    setIsGeocoding(true);
    try {
      const results = await new Promise((resolve, reject) => {
        geocoderRef.current.geocode({ location }, (results, status) => {
          if (status === 'OK' && results[0]) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
      
      const locationWithAddress = {
        ...location,
        address: results[0].formatted_address,
        placeId: results[0].place_id,
        addressComponents: results[0].address_components
      };
      
      if (isMountedRef.current) {
        setIsGeocoding(false);
      }
      return locationWithAddress;
    } catch (error) {
      console.warn('Geocoding failed:', error);
      if (isMountedRef.current) {
        setIsGeocoding(false);
      }
      
      showSmartToast('فشل في الحصول على العنوان التفصيلي', 'warning', { autoClose: 3000 });
      
      return {
        ...location,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      };
    }
  }, [showSmartToast]);





  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("متصفحك لا يدعم الموقع الجغرافي.");
      return;
    }
    
    // Prevent multiple simultaneous geolocation attempts
    if (geolocationInProgressRef.current) {
      console.log('Geolocation already in progress, skipping...');
      return;
    }
    
    geolocationInProgressRef.current = true;
    setIsGettingCurrentLocation(true);
    setIsManualSelection(false);
    setLocationError(null);
    
    // إيقاف أي عملية مراقبة سابقة
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // استراتيجية متدرجة للحصول على أفضل دقة ممكنة
    let bestLocation = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    const attemptGeolocation = (options, attemptNumber) => {
      console.log(`Geolocation attempt ${attemptNumber} with options:`, options);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          attempts++;
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          console.log(`Attempt ${attempts} - Location accuracy: ${position.coords.accuracy} meters`);
          console.log(`Attempt ${attempts} - Location coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
          
          // التحقق من صحة الإحداثيات - إذا كانت خارج مصر بشكل واضح، نستخدم موقع افتراضي
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // مصر تقع تقريباً بين خط العرض 22-32 وخط الطول 25-37
          if (lat < 22 || lat > 32 || lng < 25 || lng > 37) {
            console.log('Coordinates outside Egypt detected, using fallback location');
            showSmartToast('الإحداثيات خارج مصر! سيتم استخدام موقع افتراضي.', 'error', { autoClose: 4000 });
            
            const fallbackLocation = {
              lat: DEFAULT_CENTER.lat,
              lng: DEFAULT_CENTER.lng,
              accuracy: 1000,
              address: 'القاهرة، مصر (موقع افتراضي)'
            };
            processLocation(fallbackLocation);
            return;
          }
          
          // تحديث أفضل موقع إذا لم يكن لدينا موقع أو إذا كان هذا الموقع أدق
          if (!bestLocation || position.coords.accuracy < bestLocation.accuracy) {
            bestLocation = location;
          }
          
          // إذا حصلنا على دقة جيدة (أقل من 50 متر)، نستخدمها مباشرة
          if (position.coords.accuracy <= 50) {
            console.log('Good accuracy achieved, using location');
            processLocation(location);
            return;
          }
          
          // إذا حصلنا على دقة مقبولة (أقل من 500 متر) ووصلنا للمحاولة الثانية، نستخدمها
          if (position.coords.accuracy <= 500 && attempts >= 2) {
            console.log('Acceptable accuracy achieved after multiple attempts');
            processLocation(bestLocation);
            return;
          }
          
          // إذا وصلنا للحد الأقصى من المحاولات
          if (attempts >= maxAttempts) {
            console.log('Max attempts reached, using best location found');
            
            // إذا كانت أفضل دقة لا تزال سيئة جداً (أكثر من 100 كم)، نستخدم موقع افتراضي
            if (bestLocation.accuracy > 100000) {
              console.log('All attempts resulted in extremely poor accuracy, trying watchPosition as last resort');
              
              // محاولة أخيرة باستخدام watchPosition
              let watchAttempts = 0;
              const maxWatchAttempts = 3;
              let watchBestLocation = bestLocation;
              
              watchIdRef.current = navigator.geolocation.watchPosition(
                (watchPosition) => {
                  watchAttempts++;
                  const watchLocation = {
                    lat: watchPosition.coords.latitude,
                    lng: watchPosition.coords.longitude,
                    accuracy: watchPosition.coords.accuracy,
                    timestamp: watchPosition.timestamp
                  };
                  
                  console.log(`Watch attempt ${watchAttempts} - accuracy: ${watchPosition.coords.accuracy} meters`);
                  
                  // تحديث أفضل موقع إذا كان هذا أدق
                  if (watchPosition.coords.accuracy < watchBestLocation.accuracy) {
                    watchBestLocation = watchLocation;
                  }
                  
                  // إذا حصلنا على دقة مقبولة أو وصلنا للحد الأقصى من المحاولات
                  if (watchPosition.coords.accuracy <= 1000 || watchAttempts >= maxWatchAttempts) {
                    navigator.geolocation.clearWatch(watchIdRef.current);
                    watchIdRef.current = null;
                    
                    if (watchBestLocation.accuracy > 100000) {
                      showSmartToast('فشل في تحديد موقع دقيق. سيتم استخدام موقع افتراضي.', 'error', { autoClose: 4000 });
                      const fallbackLocation = {
                        lat: DEFAULT_CENTER.lat,
                        lng: DEFAULT_CENTER.lng,
                        accuracy: 1000,
                        address: 'القاهرة، مصر (موقع افتراضي)'
                      };
                      processLocation(fallbackLocation);
                    } else {
                      processLocation(watchBestLocation);
                    }
                  }
                },
                (watchError) => {
                  console.error('Watch position failed:', watchError);
                  navigator.geolocation.clearWatch(watchIdRef.current);
                  watchIdRef.current = null;
                  
                  showSmartToast('فشل في تحديد موقع دقيق. سيتم استخدام موقع افتراضي.', 'error', { autoClose: 4000 });
                  const fallbackLocation = {
                    lat: DEFAULT_CENTER.lat,
                    lng: DEFAULT_CENTER.lng,
                    accuracy: 1000,
                    address: 'القاهرة، مصر (موقع افتراضي)'
                  };
                  processLocation(fallbackLocation);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                }
              );
              
              // إيقاف watchPosition بعد 30 ثانية كحد أقصى
              setTimeout(() => {
                if (watchIdRef.current !== null) {
                  navigator.geolocation.clearWatch(watchIdRef.current);
                  watchIdRef.current = null;
                  processLocation(watchBestLocation);
                }
              }, 30000);
              
            } else {
              // استخدام أفضل موقع حصلنا عليه
              processLocation(bestLocation);
            }
            return;
          }
          
          // محاولة أخرى بإعدادات مختلفة
          const nextOptions = attempts === 1 
            ? { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }  // محاولة أسرع مع دقة أقل
            : { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };      // محاولة سريعة بدقة عالية
            
          setTimeout(() => attemptGeolocation(nextOptions, attempts + 1), 1000);
        },
        (error) => {
          attempts++;
          console.error(`Geolocation attempt ${attempts} failed:`, error);
          
          let errorMessage = '';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'يجب السماح بالوصول إلى الموقع في إعدادات المتصفح';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'خدمة الموقع غير متاحة على جهازك';
              break;
            case error.TIMEOUT:
              errorMessage = `انتهت مهلة المحاولة ${attempts}`;
              break;
            default:
              errorMessage = `خطأ في المحاولة ${attempts}: ${error.message}`;
          }
          
          // إذا فشلت جميع المحاولات أو كان خطأ في الصلاحيات
          if (attempts >= maxAttempts || error.code === error.PERMISSION_DENIED) {
            if (bestLocation) {
              console.log('Using best location from previous attempts');
              processLocation(bestLocation);
            } else {
              console.log('All geolocation attempts failed, using fallback location');
              setLocationError(errorMessage);
              setIsGettingCurrentLocation(false);
              geolocationInProgressRef.current = false;
              
              showSmartToast(errorMessage, 'error', { autoClose: 4000 });
              
              // استخدام موقع افتراضي
              const fallbackLocation = {
                lat: DEFAULT_CENTER.lat,
                lng: DEFAULT_CENTER.lng,
                accuracy: 1000,
                address: 'القاهرة، مصر (موقع افتراضي)'
              };
              processLocation(fallbackLocation);
            }
            return;
          }
          
          // محاولة أخرى بإعدادات مختلفة
          const nextOptions = attempts === 1 
            ? { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 }
            : { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
            
          setTimeout(() => attemptGeolocation(nextOptions, attempts + 1), 2000);
        },
        options
      );
    };
    
    // بدء المحاولة الأولى
    const initialOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };
    
    attemptGeolocation(initialOptions, 1);
    
    // دالة معالجة الموقع المشتركة
    function processLocation(loc) {
      // تحديث الموقع مباشرة
      setMarkerPosition(loc);
      setCurrentLocationAccuracy(loc.accuracy);
      setSelectedLocation({...loc, address: 'جاري تحميل العنوان...'});
      
      if (map) {
        map.panTo(loc);
        map.setZoom(18);
      }
      
      setShowInfoWindow(true);
      
      // الحصول على العنوان
      geocodeLocation(loc).then(locationWithAddress => {
        setSelectedLocation(locationWithAddress);
        onLocationSelect && onLocationSelect(locationWithAddress);
        
        showSmartToast(`تم تحديد موقعك بدقة ${Math.round(loc.accuracy)} متر`, 'success', { autoClose: 3000 });
      }).catch(() => {
        setSelectedLocation({...loc, address: 'موقعي الحالي'});
        onLocationSelect && onLocationSelect({...loc, address: 'موقعي الحالي'});
        
        showSmartToast(`تم تحديد موقعك بدقة ${Math.round(loc.accuracy)} متر`, 'success', { autoClose: 3000 });
      }).finally(() => {
        setIsGettingCurrentLocation(false);
        geolocationInProgressRef.current = false;
      });
    }
    
  }, [geocodeLocation, onLocationSelect, map, showSmartToast]);


  // تحميل الموقع الحالي عند التحميل الأول فقط
  useEffect(() => {
    if (hasInitialized || initialLocation) return;
    
    setHasInitialized(true);
    
    // If no initial location provided, try to get current location
    if (navigator.geolocation && !isManualSelection) {
      // استخدام setTimeout لتجنب مشكلة الـ dependency
      setTimeout(() => {
        getCurrentLocation();
      }, 0);
    } else if (!initialLocation) {
      // Fallback to default center
      const fallbackLocation = { ...DEFAULT_CENTER, address: 'القاهرة، مصر' };
      setSelectedLocation(fallbackLocation);
      setMarkerPosition(fallbackLocation);
      onLocationSelect && onLocationSelect(fallbackLocation);
    }
  }, [hasInitialized, initialLocation, isManualSelection, onLocationSelect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Search for places
  const searchPlaces = useCallback(async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      if (window.google && window.google.maps && window.google.maps.places) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        const request = {
          query,
          language: 'ar',
          region: 'EG',
          fields: ['place_id', 'name', 'formatted_address', 'geometry']
        };

        const results = await new Promise((resolve, reject) => {
          service.textSearch(request, (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              resolve(results);
            } else {
              reject(new Error(`Places search failed: ${status}`));
            }
          });
        });

        const searchResults = results.slice(0, 5).map(place => ({
          placeId: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));

        setSearchResults(searchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      
      showSmartToast('فشل في البحث عن الأماكن', 'error', { autoClose: 3000 });
    } finally {
      setIsSearching(false);
    }
  }, [showSmartToast]);

  // Handle search input with debouncing
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  const handleMapClick = async (event) => {
    if (!event.latLng) return;
    
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    
    // إيقاف أي عملية مراقبة للموقع جارية
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    // Mark as manual selection to prevent auto-location override
    setIsManualSelection(true);
    setLocationError(null);
    
    // Update marker immediately for better UX
    setMarkerPosition(location);
    setShowInfoWindow(true);
    
    // Set temporary address
    setSelectedLocation({...location, address: 'جاري تحميل العنوان...'});
    
    // Geocode to get address
    try {
      const locationWithAddress = await geocodeLocation(location);
      setSelectedLocation(locationWithAddress);
      onLocationSelect && onLocationSelect(locationWithAddress);
    } catch {
      // Fallback if geocoding fails
      const fallbackLocation = {
        ...location,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      };
      setSelectedLocation(fallbackLocation);
      onLocationSelect && onLocationSelect(fallbackLocation);
      
      showSmartToast('تم تحديد الموقع ولكن فشل في الحصول على العنوان التفصيلي', 'warning', { autoClose: 3000 });
    }
  };

  const handleSearchResultSelect = async (result) => {
    // إيقاف أي عملية مراقبة للموقع جارية
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    setIsManualSelection(true);
    setLocationError(null);
    setMarkerPosition(result.location);
    setSelectedLocation({
      ...result.location,
      address: result.address,
      placeId: result.placeId,
      name: result.name
    });
    
    if (map) {
      map.panTo(result.location);
      map.setZoom(16);
    }
    
    setSearchResults([]);
    setSearchQuery(result.name || result.address);
    setShowInfoWindow(true);
    onLocationSelect && onLocationSelect({
      ...result.location,
      address: result.address,
      placeId: result.placeId,
      name: result.name
    });
    
    showSmartToast(`تم تحديد الموقع: ${result.name || result.address}`, 'success', { autoClose: 3000 });
  };


  const handleSaveLocation = async () => {
    // منع النقر المتعدد
    if (isSavingLocation) {
      return;
    }
    
    if (!selectedLocation) {
      return;
    }
    
    // التحقق من وجود التوكن قبل المحاولة
    const accessToken = localStorage.getItem('access');
    if (!accessToken || accessToken.trim() === '' || accessToken === 'null' || accessToken === 'undefined') {
      showSmartToast('يجب تسجيل الدخول أولاً لحفظ الموقع', 'warning', { autoClose: 3000 });
      return;
    }
    
    setIsSavingLocation(true);
    
    try {
      await locationService.saveLocation(selectedLocation);
      showSmartToast('تم حفظ الموقع بنجاح', 'success', { autoClose: 2000 });
    } catch (error) {
      console.error('Error saving location:', error);
      showSmartToast('فشل في حفظ الموقع', 'error', { autoClose: 3000 });
    } finally {
      setIsSavingLocation(false);
    }
  };

  if (loadError) {
    return (
      <div className="location-picker-error">
        <AlertCircle size={48} className="error-icon" />
        <h3>خطأ في تحميل الخريطة</h3>
        <p>تأكد من اتصالك بالإنترنت أو أعد تحميل الصفحة</p>
        <button 
          className="current-location-button"
          onClick={() => window.location.reload()}
        >
          إعادة تحميل
        </button>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="location-picker-loading">
        <Loader2 className="loading-spinner animate-spin" size={48} />
        <p>جاري تحميل الخريطة...</p>
        <small>قد يستغرق هذا بضع ثواني</small>
      </div>
    );
  }

  return (
    <div className="location-picker">
      {/* Search Box */}
      {showSearchBox && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="location-search-input"
              placeholder="ابحث عن مكان أو عنوان..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isSearching && <Loader2 className="search-spinner animate-spin" size={16} />}
          </div>
          
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleSearchResultSelect(result)}
                >
                  <div className="result-name">
                    <strong>{result.name}</strong>
                    <br />
                    <small>{result.address}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="current-location-button-container">
        <button
          onClick={getCurrentLocation}
          disabled={isGettingCurrentLocation}
          className="current-location-button"
          title="الحصول على موقعك الحالي"
        >
          {isGettingCurrentLocation ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Crosshair size={16} />
          )}
          {isGettingCurrentLocation ? 'جاري تحديد الموقع...' : 'الموقع الحالي'}
        </button>


        {showSaveButton && selectedLocation && (
          <button
            onClick={handleSaveLocation}
            disabled={isSavingLocation}
            className="current-location-button"
            style={{ 
              background: isSavingLocation ? '#ccc' : '#1976d2',
              opacity: isSavingLocation ? 0.7 : 1,
              cursor: isSavingLocation ? 'not-allowed' : 'pointer'
            }}
            title={isSavingLocation ? "جاري حفظ الموقع..." : "حفظ الموقع المحدد"}
          >
            {isSavingLocation ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
            <Save size={16} />
            )}
            {isSavingLocation ? 'جاري الحفظ...' : 'حفظ الموقع'}
          </button>
        )}
        
        {selectedLocation && (
          <button
            onClick={() => setShowInfoWindow(!showInfoWindow)}
            className="current-location-button"
            style={{ background: '#28a745' }}
            title="عرض/إخفاء معلومات الموقع"
          >
            <Navigation size={16} />
            معلومات الموقع
          </button>
        )}
      </div>

      {/* Location Status */}
      <div className="location-status">
        {isGettingCurrentLocation && (
          <div className="location-status-item">
            <Loader2 className="animate-spin" size={14} />
            <span>جاري تحديد موقعك...</span>
          </div>
        )}
        {locationError && (
          <div className="location-error-message">
            <AlertCircle size={16} />
            <span>
              {locationError === 'permission-denied' 
                ? 'يجب السماح بالوصول إلى الموقع في إعدادات المتصفح'
                : locationError === 'unavailable'
                ? 'خدمة الموقع غير متاحة على جهازك'
                : 'انتهت مهلة محاولة الوصول إلى الموقع'
              }
            </span>
          </div>
        )}
      </div>

      {/* Location Info */}
      {selectedLocation && (
        <div className="location-info">
          <div className="location-info-header">
            <MapPin size={16} />
            <span className="location-type">
              {isManualSelection ? '📍 موقع محدد يدوياً' : '📍 موقعك الحالي'}
            </span>
            {isGeocoding && <Loader2 className="animate-spin" size={14} />}
          </div>
          <div className="location-details">
            <p className="address">{selectedLocation.address || 'عنوان غير متوفر'}</p>
            {currentLocationAccuracy && (
              <small className="accuracy">دقة الموقع: {Math.round(currentLocationAccuracy)} متر</small>
            )}
            <div className="coordinates">
              <small>
                الإحداثيات: {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}
              </small>
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container">
        <GoogleMap
          center={selectedLocation || DEFAULT_CENTER}
          zoom={selectedLocation ? 15 : 10}
          mapContainerStyle={{ width: '100%', height: `${height}px` }}
          onLoad={(mapInstance) => setMap(mapInstance)}
          onClick={handleMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
            clickableIcons: false,
            disableDoubleClickZoom: false,
            gestureHandling: 'greedy',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'on' }]
              }
            ]
          }}
        >
          {markerPosition && (
            <Marker 
              position={markerPosition}
              title={isManualSelection ? 'موقع محدد يدوياً' : 'موقعك الحالي'}
              animation={window.google?.maps?.Animation?.DROP}
              icon={{
                url: isManualSelection 
                  ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTIiIGZpbGw9IiNmZjQ0NDQiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+'
                  : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTIiIGZpbGw9IiMzMzY2ZmYiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+'
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};
