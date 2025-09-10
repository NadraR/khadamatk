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
        console.log('[NearbyServiceSearch] Fetching service types...');
        const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const url = `${baseURL}/api/services/types/`;
        console.log('[NearbyServiceSearch] Service types URL:', url);
        
        const response = await fetch(url);
        console.log('[NearbyServiceSearch] Service types response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[NearbyServiceSearch] Fetched service types:', data);
          setServicesList(data);
        } else {
          console.error('[NearbyServiceSearch] Service types fetch failed:', response.status, response.statusText);
        }
      } catch (err) {
        console.error("[NearbyServiceSearch] فشل في تحميل أنواع الخدمات", err);
      }
    };
    
    fetchServiceTypes();
  }, []);

  // جلب موقع المستخدم من الـ state أو من الخادم
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        setLocationLoading(true);
        console.log('[NearbyServiceSearch] Starting location fetch...');
        
        // محاولة جلب الموقع من الـ state أولاً (إذا جاء من صفحة الموقع)
        const locationState = location.state?.selectedLocation;
        console.log('[NearbyServiceSearch] Location state:', locationState);
        
        if (locationState && locationState.lat && locationState.lng) {
          console.log('[NearbyServiceSearch] Using location from state:', locationState);
          setUserLocation(locationState);
          setLocationLoading(false);
          return;
        }
        
        // إذا لم يكن هناك موقع في الـ state، جلب آخر موقع محفوظ
        console.log('[NearbyServiceSearch] Fetching latest location from service...');
        const result = await locationService.getLatestLocation();
        console.log('[NearbyServiceSearch] Latest location result:', result);
        
        if (result.success && result.data) {
          const locationData = result.data;
          console.log('[NearbyServiceSearch] Location data:', locationData);
          
          if (locationData.location) {
            // إذا كانت البيانات تحتوي على حقل location
            const userLoc = {
              lat: locationData.location.y,
              lng: locationData.location.x,
              address: locationData.address
            };
            console.log('[NearbyServiceSearch] Setting location from GIS field:', userLoc);
            setUserLocation(userLoc);
          } else if (locationData.lat && locationData.lng) {
            // إذا كانت البيانات تحتوي على lat/lng مباشرة
            const userLoc = {
              lat: locationData.lat,
              lng: locationData.lng,
              address: locationData.address
            };
            console.log('[NearbyServiceSearch] Setting location from lat/lng:', userLoc);
            setUserLocation(userLoc);
          } else {
            console.log('[NearbyServiceSearch] No valid location data found');
          }
        } else {
          console.log('[NearbyServiceSearch] Location service failed or no data:', result);
        }
      } catch (err) {
        console.error('[NearbyServiceSearch] Location fetch error:', err);
        setError("فشل في تحميل موقع المستخدم");
      } finally {
        setLocationLoading(false);
      }
    };
    
    fetchUserLocation();
  }, [location.state]);

  const fetchNearbyServices = useCallback(async (location) => {
    if (!location) {
      console.log('[NearbyServiceSearch] No location provided, skipping search');
      return;
    }
    
    try {
      setLoading(true);
      console.log('[NearbyServiceSearch] Starting search...');
      console.log('[NearbyServiceSearch] Service type:', selectedService);
      console.log('[NearbyServiceSearch] Location:', location);
      
      let allResults = [];
      
      // 1. البحث في الخدمات (إذا تم تحديد نوع خدمة)
      if (selectedService) {
        console.log('[NearbyServiceSearch] Searching services with type:', selectedService);
        try {
          const servicesResult = await locationService.searchNearbyServices(
            location.lat, 
            location.lng, 
            150, // radius in km
            selectedService,
            ''
          );
          
          console.log('[NearbyServiceSearch] Services API result:', servicesResult);
          
          if (servicesResult.success && servicesResult.data) {
            let servicesData = Array.isArray(servicesResult.data) ? servicesResult.data : [];
            console.log('[NearbyServiceSearch] Services found:', servicesData.length);
            console.log('[NearbyServiceSearch] First service sample:', servicesData[0]);
            
            // تحويل بيانات الخدمات لتنسيق موحد
            const formattedServices = servicesData.map(service => ({
              id: `service_${service.id}`,
              type: 'service',
              title: service.title,
              description: service.description,
              provider_username: service.provider_username,
              provider_id: service.provider,
              category: service.category,
              price: service.price,
              currency: service.currency,
              rating_avg: service.rating_avg,
              rating_count: service.rating_count,
              city: service.city,
              distance_km: service.distance_km,
              provider_location: service.provider_location,
              original_data: service
            }));
            
            console.log('[NearbyServiceSearch] Formatted services:', formattedServices.length);
            allResults.push(...formattedServices);
          } else {
            console.log('[NearbyServiceSearch] Services search failed or no data:', servicesResult);
          }
        } catch (servicesError) {
          console.error('[NearbyServiceSearch] Services search error:', servicesError);
        }
      } else {
        console.log('[NearbyServiceSearch] No service type selected, skipping services search');
      }
      
      // 2. البحث في المواقع (العمال القريبين) - دائماً
      console.log('[NearbyServiceSearch] Searching nearby workers...');
      try {
        const locationsResult = await locationService.searchNearbyLocations(
          location.lat, 
          location.lng, 
          150 // radius in km
        );
        
        console.log('[NearbyServiceSearch] Locations API result:', locationsResult);
        
        if (locationsResult.success && locationsResult.data) {
          let locationsData = Array.isArray(locationsResult.data) ? locationsResult.data : [];
          console.log('[NearbyServiceSearch] Workers found:', locationsData.length);
          console.log('[NearbyServiceSearch] First worker sample:', locationsData[0]);
          
          // تحويل بيانات المواقع لتنسيق موحد
          const formattedWorkers = locationsData.map(worker => ({
            id: `worker_${worker.id}`,
            type: 'worker',
            title: worker.user?.first_name && worker.user?.last_name 
              ? `${worker.user.first_name} ${worker.user.last_name}`
              : worker.user?.username || 'عامل',
            description: `عامل في ${worker.city || 'المنطقة'}`,
            provider_username: worker.user?.username,
            provider_id: worker.user?.id,
            category: { name: 'عامل' },
            price: worker.user?.hourly_rate || 0,
            currency: 'ج.م',
            rating_avg: worker.user?.rating || 0,
            rating_count: 0,
            city: worker.city,
            distance_km: worker.distance_km,
            provider_location: {
              lat: worker.lat,
              lng: worker.lng
            },
            worker_profile: {
              job_title: worker.user?.role === 'worker' ? 'عامل' : 'مقدم خدمة',
              skills: 'مهارات متنوعة',
              services_provided: 'خدمات عامة'
            },
            original_data: worker
          }));
          
          console.log('[NearbyServiceSearch] Formatted workers:', formattedWorkers.length);
          allResults.push(...formattedWorkers);
        } else {
          console.log('[NearbyServiceSearch] Locations search failed or no data:', locationsResult);
        }
      } catch (locationsError) {
        console.error('[NearbyServiceSearch] Locations search error:', locationsError);
      }
      
      console.log('[NearbyServiceSearch] Total results before filtering:', allResults.length);
      
      // 3. إزالة التكرار وترتيب النتائج
      const uniqueResults = allResults.filter((item, index, self) => 
        index === self.findIndex((t) => t.provider_id === item.provider_id)
      );
      
      console.log('[NearbyServiceSearch] Unique results after filtering:', uniqueResults.length);
      
      // ترتيب حسب المسافة أولاً ثم التقييم
      uniqueResults.sort((a, b) => {
        if (a.distance_km !== b.distance_km) {
          return (a.distance_km || 999) - (b.distance_km || 999);
        }
        return (b.rating_avg || 0) - (a.rating_avg || 0);
      });
      
      console.log('[NearbyServiceSearch] Final sorted results:', uniqueResults.length);
      setResults(uniqueResults);
      setLastUpdated(new Date());
      setError(null);
      
    } catch (err) {
      console.error('[NearbyServiceSearch] General search error:', err);
      setError("فشل في تحميل الخدمات القريبة");
    } finally {
      setLoading(false);
    }
  }, [selectedService]);

  const handleRefresh = useCallback(async () => {
    if (userLocation) {
      fetchNearbyServices(userLocation);
    }
  }, [userLocation, fetchNearbyServices]);


  useEffect(() => {
    if (userLocation) {
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
              disabled={loading || locationLoading}
              sx={{ color: "primary.main" }}
              title="تحديث النتائج"
            >
              <RefreshIcon />
            </IconButton>
            {/* Debug button */}
            <Button 
              onClick={() => {
                console.log('[DEBUG] Current state:', {
                  userLocation,
                  selectedService,
                  servicesList,
                  results,
                  loading,
                  locationLoading,
                  error
                });
                if (userLocation) {
                  fetchNearbyServices(userLocation);
                }
              }}
              size="small"
              variant="outlined"
              sx={{ ml: 1 }}
            >
              Debug
            </Button>
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
        ) : locationLoading || loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CircularProgress size={24} />
            <Typography>
              {locationLoading ? 'جارٍ تحديد موقعك...' : 'جارٍ تحميل الخدمات...'}
            </Typography>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography 
                      component={service.type === 'service' ? Link : 'span'}
                      to={service.type === 'service' ? `/service/${service.original_data?.id}` : undefined}
                      sx={{ 
                        textDecoration: "none", 
                        color: "primary.main",
                        fontWeight: "medium",
                        "&:hover": service.type === 'service' ? { textDecoration: "underline" } : {}
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Chip 
                      label={service.type === 'service' ? 'خدمة' : 'عامل'}
                      size="small"
                      color={service.type === 'service' ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </Box>
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
                
                {/* Service description */}
                {service.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    📋 {service.description}
                  </Typography>
                )}
                
                {/* Provider information */}
                <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                  👤 مقدم الخدمة: {service.provider_username}
                </Typography>
                
                {/* Category */}
                {service.category && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    🏷️ الفئة: {service.category.name}
                  </Typography>
                )}
                
                {/* Price */}
                <Typography variant="body2" color="success.main" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                  💰 السعر: {service.price} {service.currency || 'ج.م'}
                </Typography>
                
                {/* Rating */}
                {service.rating_avg > 0 && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
                    ⭐ التقييم: {service.rating_avg.toFixed(1)} ({service.rating_count} تقييم)
                  </Typography>
                )}
                
                {/* City */}
                {service.city && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    📍 المدينة: {service.city}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {service.type === 'service' ? (
                    <Button
                      size="small"
                      component={Link}
                      to={`/service/${service.original_data?.id}`}
                      variant="outlined"
                    >
                      عرض تفاصيل الخدمة
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      component={Link}
                      to={`/provider/${service.provider_id}`}
                      variant="outlined"
                    >
                      عرض ملف العامل
                    </Button>
                  )}
                  
                  {service.provider_location && (
                    <Button
                      size="small"
                      startIcon={<DirectionsIcon />}
                      href={`https://www.google.com/maps/dir/?api=1&destination=${service.provider_location.lat},${service.provider_location.lng}`}
                      target="_blank"
                      rel="noopener"
                      variant="text"
                    >
                      الاتجاهات
                    </Button>
                  )}
                </Box>
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