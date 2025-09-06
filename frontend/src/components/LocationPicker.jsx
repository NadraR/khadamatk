// LocationPicker.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { locationService } from '../services/LocationService';
import { MapPin, Save, Crosshair, Navigation, Search } from 'lucide-react';
import './LocationPicker.css';

const defaultCenter = { lat: 30.0444, lng: 31.2357 }; // القاهرة

// Move LIBRARIES outside component to prevent recreation on every render
const LIBRARIES = ['places', 'geometry'];

export default function LocationPicker({ onLocationSelect, height = 500, initialLocation = null, showSaveButton = true, showSearchBox = true }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
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
  
  const searchTimeoutRef = useRef(null);
  const geocoderRef = useRef(null);

  // Initialize geocoder
  useEffect(() => {
    if (isLoaded && window.google && window.google.maps) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // تحميل الموقع الحالي عند التحميل الأول فقط
  useEffect(() => {
    if (hasInitialized || initialLocation) return;
    
    setHasInitialized(true);
    
    // If no initial location provided, try to get current location
    if (navigator.geolocation && !isManualSelection) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'موقعي الحالي',
            accuracy: position.coords.accuracy
          };
          setSelectedLocation(currentLocation);
          setMarkerPosition(currentLocation);
          setCurrentLocationAccuracy(position.coords.accuracy);
          onLocationSelect && onLocationSelect(currentLocation);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default center
          const fallbackLocation = { ...defaultCenter, address: 'القاهرة، مصر' };
          setSelectedLocation(fallbackLocation);
          setMarkerPosition(fallbackLocation);
          onLocationSelect && onLocationSelect(fallbackLocation);
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 300000 // 5 minutes cache
        }
      );
    } else if (!initialLocation) {
      // Fallback to default center
      const fallbackLocation = { ...defaultCenter, address: 'القاهرة، مصر' };
      setSelectedLocation(fallbackLocation);
      setMarkerPosition(fallbackLocation);
      onLocationSelect && onLocationSelect(fallbackLocation);
    }
  }, [hasInitialized, initialLocation, isManualSelection, onLocationSelect]);

  // Geocode location to get address
  const geocodeLocation = useCallback(async (location) => {
    if (!geocoderRef.current) return location;
    
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
      
      return {
        ...location,
        address: results[0].formatted_address,
        placeId: results[0].place_id,
        addressComponents: results[0].address_components
      };
    } catch (error) {
      console.warn('Geocoding failed:', error);
      return {
        ...location,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      };
    }
  }, []);

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
    } finally {
      setIsSearching(false);
    }
  }, []);

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم الموقع الحالي');
      return;
    }
    
    setIsGettingCurrentLocation(true);
    setIsManualSelection(false);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        // Geocode to get address
        const locationWithAddress = await geocodeLocation(location);
        locationWithAddress.address = 'موقعي الحالي - ' + (locationWithAddress.address || 'موقع غير محدد');
        
        setSelectedLocation(locationWithAddress);
        setMarkerPosition(locationWithAddress);
        setCurrentLocationAccuracy(position.coords.accuracy);
        onLocationSelect && onLocationSelect(locationWithAddress);

        if (map) {
          map.panTo(location);
          map.setZoom(16);
        }
        
        setShowInfoWindow(true);
        toast.success(`تم تحديد موقعك بنجاح (دقة: ${Math.round(position.coords.accuracy)}م)`);
        setIsGettingCurrentLocation(false);
      },
      (error) => {
        let errorMessage = 'فشل في الحصول على الموقع';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض الإذن للوصول إلى الموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'الموقع غير متاح';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة الحصول على الموقع';
            break;
        }
        toast.error(errorMessage);
        setIsGettingCurrentLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 60000 // 1 minute cache
      }
    );
  };

  const handleMapClick = async (event) => {
    if (!event.latLng) return;
    
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    
    // Mark as manual selection to prevent auto-location override
    setIsManualSelection(true);
    
    // Update marker immediately for better UX
    setMarkerPosition(location);
    setShowInfoWindow(true);
    
    // Geocode to get address
    try {
      const locationWithAddress = await geocodeLocation(location);
      setSelectedLocation(locationWithAddress);
      onLocationSelect && onLocationSelect(locationWithAddress);
      toast.success('تم تحديد الموقع يدوياً');
    } catch (error) {
      // Fallback if geocoding fails
      const fallbackLocation = {
        ...location,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      };
      setSelectedLocation(fallbackLocation);
      onLocationSelect && onLocationSelect(fallbackLocation);
      toast.success('تم تحديد الموقع يدوياً');
    }
  };

  const handleSearchResultSelect = async (result) => {
    setIsManualSelection(true);
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
    
    toast.success('تم اختيار الموقع من نتائج البحث');
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      toast.error('⚠️ لم يتم اختيار موقع بعد');
      return;
    }
    try {
      const res = await locationService.saveLocation(selectedLocation);
      if (res.success) {
        toast.success('تم حفظ الموقع بنجاح ✅');
      } else {
        toast.error('فشل في حفظ الموقع ❌');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      toast.error('حدث خطأ أثناء الحفظ ❌');
    }
  };

  if (loadError) {
    return (
      <div className="location-picker-error">
        <div className="error-icon">⚠️</div>
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
        <div className="loading-spinner"></div>
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
            <input
              type="text"
              className="location-search-input"
              placeholder="ابحث عن مكان أو عنوان..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {isSearching && <div className="search-spinner spinner-small"></div>}
            <Search className="search-icon" size={20} />
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
            <div className="spinner-small"></div>
          ) : (
            <Crosshair size={16} />
          )}
          {isGettingCurrentLocation ? 'جاري تحديد الموقع...' : 'الموقع الحالي'}
        </button>

        {showSaveButton && selectedLocation && (
          <button
            onClick={handleSaveLocation}
            className="current-location-button"
            style={{ background: '#1976d2' }}
            title="حفظ الموقع المحدد"
          >
            <Save size={16} />
            حفظ الموقع
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

      {/* Location Info */}
      {selectedLocation && (
        <div className="location-info">
          <div className="location-info-header">
            <MapPin size={16} />
            <span className="location-type">
              {isManualSelection ? '📍 موقع محدد يدوياً' : '📍 موقعك الحالي'}
            </span>
          </div>
          <div className="location-details">
            <p className="address">{selectedLocation.address || 'عنوان غير متوفر'}</p>
            {currentLocationAccuracy && (
              <small className="accuracy">دقة الموقع: {Math.round(currentLocationAccuracy)} متر</small>
            )}
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="map-container">
        <GoogleMap
          center={selectedLocation || defaultCenter}
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
              animation={window.google?.maps?.Animation?.BOUNCE}
              icon={{
                url: isManualSelection 
                  ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNGRjY5MDAiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg=='
                  : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMwMDdCRkYiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==',
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12)
              }}
            >
              {showInfoWindow && (
                <InfoWindow
                  onCloseClick={() => setShowInfoWindow(false)}
                >
                  <div className="info-window-content">
                    <h4>{isManualSelection ? 'موقع محدد يدوياً' : 'موقعك الحالي'}</h4>
                    <p>{selectedLocation.address}</p>
                    {selectedLocation.name && (
                      <p><strong>{selectedLocation.name}</strong></p>
                    )}
                    <div className="coordinates">
                      <small>
                        {selectedLocation.lat?.toFixed(6)}, {selectedLocation.lng?.toFixed(6)}
                      </small>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          )}
        </GoogleMap>
      </div>

      {/* Instructions */}
      <div className="location-instructions">
        <p>💡 <strong>تلميح:</strong> انقر على الخريطة لتحديد موقع يدوياً أو استخدم زر "الموقع الحالي"</p>
      </div>
    </div>
  );
}
