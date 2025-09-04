// LocationPicker.jsx
import React, { useState, useEffect } from 'react';
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import { locationService } from '../services/LocationService';
import { MapPin, Save, Crosshair } from 'lucide-react';
import './LocationPicker.css';

const defaultCenter = { lat: 30.0444, lng: 31.2357 }; // القاهرة

// Move LIBRARIES outside component to prevent recreation on every render
const LIBRARIES = ['places', 'geometry'];

export default function LocationPicker({ onLocationSelect, height = 500 }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
    language: 'ar',
    region: 'EG',
  });

  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);

  // تحميل الموقع الحالي عند التحميل
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'موقعي الحالي',
          };
          setSelectedLocation(currentLocation);
          setMarkerPosition(currentLocation);
          onLocationSelect && onLocationSelect(currentLocation);
        },
        () => {
          setSelectedLocation(defaultCenter);
          setMarkerPosition(defaultCenter);
        }
      );
    } else {
      setSelectedLocation(defaultCenter);
      setMarkerPosition(defaultCenter);
    }
  }, [onLocationSelect]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم الموقع الحالي');
      return;
    }
    setIsGettingCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: 'موقعي الحالي',
        };
        setSelectedLocation(location);
        setMarkerPosition(location);
        onLocationSelect && onLocationSelect(location);

        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }
        toast.success('تم تحديد موقعك بنجاح');
        setIsGettingCurrentLocation(false);
      },
      () => {
        toast.error('فشل في الحصول على الموقع');
        setIsGettingCurrentLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        location.address = results[0].formatted_address;
      } else {
        location.address = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      }
      setSelectedLocation(location);
      setMarkerPosition(location);
      onLocationSelect && onLocationSelect(location);
    });
  };

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

  if (loadError) return <div className="location-picker-error">خطأ في تحميل الخريطة</div>;
  if (!isLoaded) return <div className="location-picker-loading">جاري تحميل الخريطة...</div>;

  return (
    <div className="location-picker">
      <div className="current-location-button-container">
        <button
          onClick={getCurrentLocation}
          disabled={isGettingCurrentLocation}
          className="current-location-button"
        >
          <Crosshair size={16} />
          {isGettingCurrentLocation ? 'جاري تحديد الموقع...' : 'الموقع الحالي'}
        </button>

        <button
          onClick={handleSaveLocation}
          className="current-location-button"
          style={{ background: '#1976d2' }}
        >
          <Save size={16} />
          حفظ الموقع
        </button>
      </div>

      

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
          }}
        >
          {markerPosition && <Marker position={markerPosition} />}
        </GoogleMap>
      </div>
    </div>
  );
}
