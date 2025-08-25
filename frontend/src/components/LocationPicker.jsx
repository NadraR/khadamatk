import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import { reverseGeocodeFunction } from '../utils/geocodeUtils'; 

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '8px',
    border: '1px solid #ddd'
};

const defaultCenter = { lat: 30.0444, lng: 31.2357 };

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [{ featureType: "poi", stylers: [{ visibility: "on" }] }]
};

export default function LocationPicker({ onLocationSelect, initialLocation }) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places'],
        language: 'ar'
    });

    const [map, setMap] = useState(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(initialLocation || defaultCenter);
    const [markers, setMarkers] = useState(initialLocation ? [initialLocation] : []);
    const [infoWindowOpen, setInfoWindowOpen] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const autocompleteRef = useRef(null);

    const markerIcon = isLoaded ? {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(40, 40)
    } : null;

    useEffect(() => {
        if (initialLocation && map) {
            setSelectedLocation(initialLocation);
            setMarkers([initialLocation]);
            map.panTo(initialLocation);
            map.setZoom(15);
        }
    }, [initialLocation, map]);

    const onMapClick = useCallback((event) => {
        const newLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            address: ''
        };
        setSelectedLocation(newLocation);
        setMarkers([newLocation]);
        onLocationSelect?.(newLocation);
        setInfoWindowOpen(true);

        reverseGeocodeFunction(newLocation.lat, newLocation.lng, setSelectedLocation, onLocationSelect);
    }, [onLocationSelect]);

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                const newLocation = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address: place.formatted_address || ''
                };
                setSelectedLocation(newLocation);
                setMarkers([newLocation]);
                setSearchQuery(place.formatted_address || '');
                onLocationSelect?.(newLocation);
                if (map) {
                    map.panTo(newLocation);
                    map.setZoom(15);
                }
                setInfoWindowOpen(true);
            }
        }
    };

    const onAutocompleteLoad = (autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            setIsLoadingLocation(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        address: ''
                    };
                    setSelectedLocation(newLocation);
                    setMarkers([newLocation]);
                    onLocationSelect?.(newLocation);
                    if (map) { map.panTo(newLocation); map.setZoom(15); }
                    setInfoWindowOpen(true);

                    await reverseGeocodeFunction(newLocation.lat, newLocation.lng, setSelectedLocation, onLocationSelect);
                    setIsLoadingLocation(false);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('تعذر الحصول على موقعك الحالي. تأكد من تفعيل GPS.');
                    setIsLoadingLocation(false);
                },
                { timeout: 10000, enableHighAccuracy: true, maximumAge: 300000 }
            );
        } else {
            alert('المتصفح لا يدعم تحديد الموقع الجغرافي.');
        }
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    if (loadError) return <div style={{ padding: '20px', background: '#f8d7da', color: '#721c24', borderRadius: '5px', textAlign: 'center' }}>❌ خطأ في تحميل الخريطة. تأكد من صحة مفتاح API.</div>;
    if (!isLoaded || mapLoading) return <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>⏳ جارٍ تحميل الخريطة...</div>;

    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px', alignItems: 'center' }}>
                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged} options={{ types: ['geocode'], componentRestrictions: { country: 'eg' } }}>
                    <input
                        type="text"
                        placeholder="🔍 ابحث عن عنوان أو مكان..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        style={{ flex: 1, minWidth: '250px', height: '45px', padding: '0 15px', borderRadius: '8px', border: '2px solid #ddd', fontSize: '16px' }}
                    />
                </Autocomplete>
                <button
                    onClick={handleUseCurrentLocation}
                    disabled={isLoadingLocation}
                    style={{ padding: '12px 20px', background: isLoadingLocation ? '#ccc' : '#28a745', color: '#fff', border: 'none', borderRadius: '8px', cursor: isLoadingLocation ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    {isLoadingLocation ? <>⏳ جاري التحديد...</> : <>📍 استخدام موقعي الحالي</>}
                </button>
            </div>

            <div style={{ position: 'relative' }}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={selectedLocation}
                    zoom={12}
                    onLoad={(mapInstance) => { setMap(mapInstance); setMapLoading(false); }}
                    onClick={onMapClick}
                    options={mapOptions}
                >
                    {markers.map((marker, index) => (
                        <Marker key={index} position={marker} onClick={() => setInfoWindowOpen(true)} icon={markerIcon} />
                    ))}

                    {infoWindowOpen && selectedLocation && (
                        <InfoWindow position={selectedLocation} onCloseClick={() => setInfoWindowOpen(false)}>
                            <div style={{ padding: '10px' }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>📍 الموقع المحدد</h4>
                                <p><strong>خط العرض:</strong> {selectedLocation.lat.toFixed(6)}</p>
                                <p><strong>خط الطول:</strong> {selectedLocation.lng.toFixed(6)}</p>
                                {selectedLocation.address && <p style={{ color: '#666' }}><strong>العنوان:</strong> {selectedLocation.address}</p>}
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 6px rgba(0,0,0,0.3)', fontSize: '14px' }}>💡 انقر على الخريطة لتحديد موقع</div>
            </div>

            {selectedLocation && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                    <h4>الإحداثيات المحددة:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div><strong>خط العرض:</strong> {selectedLocation.lat.toFixed(6)}</div>
                        <div><strong>خط الطول:</strong> {selectedLocation.lng.toFixed(6)}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
