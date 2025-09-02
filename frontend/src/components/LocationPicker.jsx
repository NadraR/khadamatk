// LocationPicker.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useJsApiLoader, GoogleMap } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { getTranslations } from '../utils/translations';

// الموقع الافتراضي لو ما فيش موقع محفوظ
const defaultCenter = { lat: 30.0444, lng: 31.2357 }; // القاهرة

// Libraries ثابتة لتجنب تحذيرات
const LIBRARIES = ['places'];

// Helper function to validate coordinates
const isValidCoordinates = (coords) => {
  if (!coords || typeof coords !== 'object') return false;
  const { lat, lng } = coords;
  return (
    typeof lat === 'number' && 
    typeof lng === 'number' && 
    !isNaN(lat) && 
    !isNaN(lng) && 
    lat >= -90 && lat <= 90 && 
    lng >= -180 && lng <= 180
  );
};

export default function LocationPicker({
  onLocationSelect,
  initialLocation = null,
  height = 500,
  showSearch = true,
  showCurrentLocation = true,
  showCoordinates = true,
  language = 'ar',
  className = ''
}) {
  // Use stable configuration to prevent loader conflicts
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    // Use stable language to prevent reloading
    language: 'en', // Keep it stable
    region: 'EG',
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Get translations
  const t = getTranslations(language, 'locationPicker');

  // Initialize location
  useEffect(() => {
    if (initialLocation && isValidCoordinates(initialLocation)) {
      setSelectedLocation(initialLocation);
    } else {
      setSelectedLocation(defaultCenter);
    }
  }, [initialLocation]);

  // Get current location from browser
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t.geolocationNotSupported || 'المتصفح لا يدعم الحصول على الموقع الحالي');
      return;
    }

    setIsGettingCurrentLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: t.currentLocation || 'موقعك الحالي',
        };
        
        if (isValidCoordinates(location)) {
          setSelectedLocation(location);
          onLocationSelect && onLocationSelect(location);
          
          if (map) {
            map.panTo(location);
            map.setZoom(15);
          }
          
          toast.success(t.locationSuccess || 'تم تحديد موقعك الحالي بنجاح');
        } else {
          toast.error(t.invalidCoordinates || 'إحداثيات غير صالحة');
        }
        
        setIsGettingCurrentLocation(false);
      },
      (error) => {
        let errorMessage = t.locationError || 'فشل في الحصول على الموقع الحالي';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t.locationPermissionDenied || 'تم رفض طلب الحصول على الموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t.locationUnavailable || 'معلومات الموقع غير متاحة';
            break;
          case error.TIMEOUT:
            errorMessage = t.locationTimeout || 'انتهت مهلة طلب الموقع';
            break;
          default:
            errorMessage = t.unexpectedError || 'حدث خطأ غير متوقع';
        }
        
        toast.error(errorMessage);
        setIsGettingCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) {
      performSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  // Perform place search
  const performSearch = async (query) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }

    setIsSearching(true);
    
    try {
      const service = new window.google.maps.places.PlacesService(map || document.createElement('div'));
      
      const request = {
        query: query,
        fields: ['name', 'geometry', 'formatted_address']
      };

      service.textSearch(request, (results, status) => {
        setIsSearching(false);
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setSearchResults(results.slice(0, 5)); // Limit to 5 results
        } else {
          setSearchResults([]);
        }
      });
    } catch (error) {
      console.error('Search error:', error);
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  // Handle place selection from search results
  const handlePlaceSelect = (place) => {
    if (place && place.geometry && place.geometry.location) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.formatted_address,
      };

      if (isValidCoordinates(location)) {
        setSelectedLocation(location);
        onLocationSelect && onLocationSelect(location);
        
        // Move map to new location
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }
        
        // Clear search
        setSearchQuery('');
        setSearchResults([]);
        
        toast.success(t.locationSelected || 'تم تحديد الموقع بنجاح');
      } else {
        toast.error(t.invalidCoordinates || 'إحداثيات غير صالحة');
      }
    }
  };

  const handleMapClick = (event) => {
    if (event.latLng) {
      const location = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      
      if (isValidCoordinates(location)) {
        setSelectedLocation(location);
        onLocationSelect && onLocationSelect(location);
      } else {
        toast.error(t.invalidCoordinates || 'إحداثيات غير صالحة');
      }
    }
  };

    // Current location functionality is now handled by getCurrentLocation function above

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loadError) {
    return (
      <div className="location-picker-error">
        <div className="error-icon">!</div>
        <h3>{t.mapError || 'خطأ في تحميل الخريطة'}</h3>
        <p>{t.mapErrorDescription || 'حدث خطأ أثناء تحميل خريطة جوجل. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'}</p>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="location-picker-loading">
        <div className="loading-spinner"></div>
        <p>{t.loadingMap || 'جاري تحميل الخريطة...'}</p>
      </div>
    );
  }

  // Ensure we have valid coordinates before rendering the map
  const mapCenter = selectedLocation && isValidCoordinates(selectedLocation) ? selectedLocation : defaultCenter;

  return (
    <div className={`location-picker ${className}`}>
      {showSearch && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              placeholder={t.searchPlaceholder || 'ابحث عن مكان...'}
              className="location-search-input"
            />
            {isSearching && (
              <div className="search-spinner">
                <div className="spinner-small"></div>
              </div>
            )}
          </div>
          
          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div ref={searchResultsRef} className="search-results">
              {searchResults.map((place, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handlePlaceSelect(place)}
                >
                  <div className="result-name">{place.name}</div>
                  <div className="result-address">{place.formatted_address}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Current Location Button */}
      <div className="current-location-button-container">
        <button
          onClick={getCurrentLocation}
          disabled={isGettingCurrentLocation}
          className="current-location-button"
          title={t.currentLocation || 'الموقع الحالي'}
        >
          {isGettingCurrentLocation ? (
            <>
              <div className="spinner-small"></div>
              <span>{t.gettingLocation || 'جاري تحديد الموقع...'}</span>
            </>
          ) : (
            <>
              <i className="fas fa-crosshairs"></i>
              <span>{t.currentLocation || 'الموقع الحالي'}</span>
            </>
          )}
        </button>
      </div>

      <div className="map-container">
        <GoogleMap
          center={mapCenter}
          zoom={12}
          mapContainerStyle={{ width: '100%', height: `${height}px` }}
          onLoad={(mapInstance) => setMap(mapInstance)}
          onClick={handleMapClick}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {selectedLocation && isValidCoordinates(selectedLocation) && (
            <div
              className="custom-marker"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -100%)',
                width: '20px',
                height: '20px',
                backgroundColor: '#8B0000', // Maroon color
                border: '2px solid white',
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                zIndex: 1000
              }}
            />
          )}
        </GoogleMap>
      </div>

      {/* Current location functionality is now handled above the map */}

      {showCoordinates && selectedLocation && isValidCoordinates(selectedLocation) && (
        <div className="coordinates-display">
          <div className="coordinate-item">
            <span className="coordinate-label">{t.latitude || 'خط العرض'}:</span>
            <span className="coordinate-value">{selectedLocation.lat?.toFixed(6)}</span>
          </div>
          <div className="coordinate-item">
            <span className="coordinate-label">{t.longitude || 'خط الطول'}:</span>
            <span className="coordinate-value">{selectedLocation.lng?.toFixed(6)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
