import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';
import { locationService } from '../services/LocationService';
import { authService } from '../services/authService';

function LocationPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const [myLocationLoaded, setMyLocationLoaded] = useState(false);
  const navigate = useNavigate();

  // جلب الموقع الحالي عند الدخول
  useEffect(() => {
    const fetchMyLocation = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        const result = await locationService.getMyLocation();
        if (result.success && result.data) {
          // البيانات تأتي مباشرة كـ { lat, lng, address, ... }
          setSelectedLocation(result.data);
        }
      } catch (err) {
        console.error('Error fetching my location:', err);
      } finally {
        setMyLocationLoaded(true);
      }
    };

    fetchMyLocation();
  }, [navigate]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setMessage('');
    setNearbyLocations([]); // مسح النتائج القديمة عند اختيار موقع جديد
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) {
      setMessage('يرجى تحديد موقع أولاً');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    if (!authService.isAuthenticated()) {
      setMessage('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
      setMessageType('error');
      setIsLoading(false);
      navigate('/login');
      return;
    }

    // إرسال البيانات بالهيكل الصحيح
    const locationData = {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: selectedLocation.address || ''
    };

    const result = await locationService.saveMyLocation(locationData);

    if (result.success) {
      setMessage(result.message);
      setMessageType('success');
      console.log('تم حفظ الموقع:', result.data);
    } else {
      setMessage(result.error);
      setMessageType('error');
      if (result.status === 401) {
        authService.clearAuth();
        navigate('/login');
      }
    }

    setIsLoading(false);
  };

  const handleSearchNearby = async () => {
    if (!selectedLocation) {
      setMessage('يرجى تحديد موقعك أولاً للبحث عن المواقع القريبة');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const { lat, lng } = selectedLocation;
    const result = await locationService.searchNearbyLocations(lat, lng);

    if (result.success) {
      setNearbyLocations(result.data);
      setMessage(`تم العثور على ${result.data.length} موقع قريب`);
      setMessageType('success');
    } else {
      setMessage(result.error);
      setMessageType('error');
    }

    setIsLoading(false);
  };

  const handleDeleteLocation = async () => {
    if (!confirm('هل أنت متأكد من حذف موقعك؟')) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    const result = await locationService.deleteMyLocation();

    if (result.success) {
      setMessage('تم حذف الموقع بنجاح');
      setMessageType('success');
      setSelectedLocation(null);
      setNearbyLocations([]);
    } else {
      setMessage(result.error);
      setMessageType('error');
    }

    setIsLoading(false);
  };

  return (
    <div className="location-page-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🌍 إدارة الموقع</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        يمكنك تحديد موقعك على الخريطة أو استخدام البحث، ثم حفظه أو البحث عن أشخاص قريبين منك
      </p>

      {myLocationLoaded && (
        <LocationPicker 
          onLocationSelect={handleLocationSelect} 
          initialLocation={selectedLocation}
        />
      )}

      {selectedLocation && (
        <div className="selected-location-info" style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '8px',
          margin: '15px 0'
        }}>
          <h3>📍 الموقع المحدد:</h3>
          <p><strong>خط العرض:</strong> {selectedLocation.lat?.toFixed(6)}</p>
          <p><strong>خط الطول:</strong> {selectedLocation.lng?.toFixed(6)}</p>
          {selectedLocation.address && (
            <p><strong>العنوان:</strong> {selectedLocation.address}</p>
          )}
        </div>
      )}

      <div className="action-buttons" style={{ 
        display: 'flex', 
        gap: '10px', 
        margin: '20px 0',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={handleSaveLocation} 
          disabled={isLoading || !selectedLocation}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading || !selectedLocation ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '⏳ جاري الحفظ...' : '💾 حفظ الموقع'}
        </button>
        
        <button 
          onClick={handleSearchNearby} 
          disabled={isLoading || !selectedLocation}
          style={{
            padding: '10px 20px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading || !selectedLocation ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? '⏳ جاري البحث...' : '🔍 البحث عن مواقع قريبة'}
        </button>
        
        {selectedLocation && (
          <button 
            onClick={handleDeleteLocation} 
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '⏳ جاري الحذف...' : '🗑️ حذف الموقع'}
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${messageType}`} style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '5px',
          background: messageType === 'success' ? '#d4edda' : '#f8d7da',
          color: messageType === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${messageType === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {nearbyLocations.length > 0 && (
        <div className="nearby-locations" style={{
          marginTop: '20px',
          padding: '15px',
          background: '#e9ecef',
          borderRadius: '8px'
        }}>
          <h3>👥 الأشخاص القريبون منك ({nearbyLocations.length})</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {nearbyLocations.map((loc, index) => (
              <div key={index} style={{
                padding: '10px',
                background: 'white',
                borderRadius: '5px',
                border: '1px solid #ddd'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {loc.user?.first_name && loc.user?.last_name 
                    ? `${loc.user.first_name} ${loc.user.last_name}`
                    : loc.user?.username || 'مستخدم'
                  }
                  {loc.user?.role === 'worker' && ' 👷‍♂️'}
                  {loc.user?.role === 'client' && ' 👤'}
                </div>
                {loc.address && <div>📍 {loc.address}</div>}
                {loc.distance_km && (
                  <div style={{ color: '#666', fontSize: '0.9em' }}>
                    المسافة: {loc.distance_km} كم
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {nearbyLocations.length === 0 && selectedLocation && (
        <div style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
          اضغط على "البحث عن مواقع قريبة" لرؤية الأشخاص القريبين منك
        </div>
      )}
    </div>
  );
}

export default LocationPage;