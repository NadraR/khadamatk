import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Box, Typography, CircularProgress, Chip, Button, List, ListItem, Alert,
  IconButton, Paper, MenuItem, Select, FormControl, InputLabel, Container
} from "@mui/material";
import { LocationOn as LocationIcon, Directions as DirectionsIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { locationService } from '../services/LocationService';

export default function NearbyServiceSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedService, setSelectedService] = useState(""); // نوع الخدمة المختار
  const [servicesList, setServicesList] = useState([]); // قائمة أنواع الخدمات
  const [userLocation, setUserLocation] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // جلب أنواع الخدمات المتاحة (مرة واحدة)
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const response = await fetch(`${baseURL}/api/services/types/`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched service types:', data);
          setServicesList(data);
        }
      } catch (err) {
        console.error("فشل في تحميل أنواع الخدمات", err);
      }
    };
    
    fetchServiceTypes();
  }, []);

  // جلب موقع المستخدم من الـ state أو من الخادم
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        setLocationLoading(true);
        
        // محاولة جلب الموقع من الـ state أولاً (إذا جاء من صفحة الموقع)
        const locationState = location.state?.selectedLocation;
        if (locationState && locationState.lat && locationState.lng) {
          setUserLocation(locationState);
          setLocationLoading(false);
          return;
        }
        
        // إذا لم يكن هناك موقع في الـ state، جلب آخر موقع محفوظ
        const result = await locationService.getLatestLocation();
        if (result.success && result.data) {
          const locationData = result.data;
          if (locationData.location) {
            // إذا كانت البيانات تحتوي على حقل location
            setUserLocation({
              lat: locationData.location.y,
              lng: locationData.location.x,
              address: locationData.address
            });
          } else if (locationData.lat && locationData.lng) {
            // إذا كانت البيانات تحتوي على lat/lng مباشرة
            setUserLocation({
              lat: locationData.lat,
              lng: locationData.lng,
              address: locationData.address
            });
          }
        }
      } catch (err) {
        setError("فشل في تحميل موقع المستخدم");
        console.error(err);
      } finally {
        setLocationLoading(false);
      }
    };
    
    fetchUserLocation();
  }, [location.state]);

  const fetchNearbyServices = useCallback(async (location) => {
    if (!location || !selectedService) return;
    
    try {
      setLoading(true);
      console.log('Searching for service type:', selectedService);
      const result = await locationService.searchNearbyLocations(
        location.lat, 
        location.lng, 
        150, // radius in km - increased for better results
        selectedService, // pass the selected service type
        100  // max results
      );
      
      if (result.success) {
        console.log('Search results:', result.data);
        setResults(result.data?.results || []);
        setLastUpdated(new Date());
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

  const handleRefresh = useCallback(async () => {
    if (userLocation) {
      fetchNearbyServices(userLocation);
    }
  }, [userLocation, fetchNearbyServices]);

  const getDirectionsUrl = (service) => {
    const lat = service.lat || service.location_lat;
    const lng = service.lng || service.location_lng;
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  useEffect(() => {
    if (userLocation && selectedService) {
      fetchNearbyServices(userLocation);
    }
  }, [userLocation, selectedService, fetchNearbyServices]);

  const handleLocationUpdate = () => {
    navigate('/location');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)" }}>
        
        {/* معلومات الموقع الحالي */}
        {userLocation && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: "white", borderRadius: 2, border: "1px solid #e0e0e0" }}>
            <Typography variant="h6" sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <LocationIcon color="primary" />
              موقعك الحالي
            </Typography>
            <Typography variant="body2" color="text.secondary">
              خط العرض: {userLocation.lat?.toFixed(6)} | خط الطول: {userLocation.lng?.toFixed(6)}
            </Typography>
            {userLocation.address && (
              <Typography variant="body2" color="text.secondary">
                العنوان: {userLocation.address}
              </Typography>
            )}
            <Button 
              size="small" 
              variant="outlined" 
              onClick={handleLocationUpdate}
              sx={{ mt: 1 }}
            >
              تحديث الموقع
            </Button>
          </Box>
        )}

        {/* اختيار الخدمة */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>اختر نوع الخدمة</InputLabel>
          <Select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            label="اختر نوع الخدمة"
          >
            <MenuItem value="">
              <em>اختر نوع الخدمة</em>
            </MenuItem>
            {Array.isArray(servicesList) && servicesList.map(service => (
              <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2d3748" }}>
            أقرب مزودي الخدمة
          </Typography>
          <Box>
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading || locationLoading || !selectedService}
              sx={{ color: "primary.main" }}
              title="تحديث النتائج"
            >
              <RefreshIcon />
            </IconButton>
            {lastUpdated && (
              <Typography variant="caption" sx={{ color: "text.secondary", ml: 1 }}>
                {lastUpdated.toLocaleTimeString('ar-SA')}
              </Typography>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}
            action={<Button color="inherit" size="small" onClick={handleRefresh}>حاول مرة أخرى</Button>}
          >
            {error}
          </Alert>
        )}

        {!userLocation ? (
          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
            <LocationIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
            <Typography>يرجى تحديد موقعك أولاً</Typography>
            <Button 
              variant="contained" 
              onClick={handleLocationUpdate}
              sx={{ mt: 2 }}
            >
              تحديد الموقع
            </Button>
          </Box>
        ) : !selectedService ? (
          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
            <LocationIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
            <Typography>يرجى اختيار نوع الخدمة لعرض النتائج</Typography>
          </Box>
        ) : locationLoading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CircularProgress size={24} />
            <Typography>جارٍ تحديد موقعك...</Typography>
          </Box>
        ) : loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CircularProgress size={24} />
            <Typography>جارٍ تحميل الخدمات...</Typography>
          </Box>
        ) : results.length > 0 ? (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {results.map(service => (
              <ListItem 
                key={service.id} 
                sx={{ 
                  flexDirection: "column", 
                  alignItems: "flex-start",
                  backgroundColor: "white",
                  mb: 1,
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    transition: "box-shadow 0.3s ease"
                  }
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <Typography 
                    component={Link} 
                    to={`/services/${service.id}`} 
                    sx={{ 
                      textDecoration: "none", 
                      color: "primary.main",
                      fontWeight: "medium",
                      "&:hover": { textDecoration: "underline" }
                    }}
                  >
                    {service.user?.first_name && service.user?.last_name 
                      ? `${service.user.first_name} ${service.user.last_name}`
                      : service.user?.username || 'مزود خدمة'
                    }
                  </Typography>
                  {service.distance_km != null && (
                    <Chip 
                      icon={<LocationIcon />}
                      label={`${service.distance_km.toFixed(1)} كم`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>
                
                {service.address && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    📍 {service.address}
                  </Typography>
                )}
                
                {service.user?.role && (
                  <Typography variant="body2" color="text.secondary">
                    {service.user.role === 'worker' && '👷‍♂️ عامل'}
                    {service.user.role === 'client' && '👤 عميل'}
                  </Typography>
                )}
                
                <Button
                  size="small"
                  startIcon={<DirectionsIcon />}
                  href={getDirectionsUrl(service)}
                  target="_blank"
                  rel="noopener"
                  sx={{ mt: 1 }}
                >
                  عرض الاتجاهات
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>
            <LocationIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
            <Typography>لا توجد خدمات قريبة ضمن نطاق 10 كم</Typography>
            <Button 
              onClick={handleRefresh}
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              sx={{ mt: 1 }}
            >
              تحديث البحث
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
