// src/pages/admin/ServicesPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  MonetizationOn as PriceIcon,
} from '@mui/icons-material';
import { adminApiService } from '../../services/adminApiService';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await adminApiService.getServices();
      setServices(data);
    } catch (err) {
      setError('فشل في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (serviceId) => {
    try {
      await adminApiService.toggleServiceActive(serviceId);
      fetchServices();
    } catch (err) {
      setError('فشل في تحديث حالة الخدمة');
    }
  };

  // عرض Skeleton أثناء التحميل
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          جاري تحميل الخدمات...
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {[...Array(6)].map((_, idx) => (
            <Skeleton
              key={idx}
              variant="rounded"
              height={180}
              sx={{ borderRadius: 3 }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* عنوان الصفحة */}
      <Typography
        variant="h4"
        textAlign="center"
        sx={{
          fontWeight: 800,
          mb: 4,
          p: 2,
          borderRadius: 3,
          bgcolor: '#f1fdf5',
          color: '#2e7d32',
          border: '2px solid #81c784',
          boxShadow: '0 4px 20px rgba(46,125,50,0.15)',
        }}
      >
        إدارة الخدمات
      </Typography>

      {/* رسالة الخطأ */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* الكروت */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: { xs: 2, md: 3 },
        }}
      >
        {services.map((service) => (
          <Paper
            key={service.id}
            sx={{
              p: 3,
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              background: 'linear-gradient(135deg, #f9fdf9, #ffffff)',
              border: '1px solid #e0e0e0',
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
              },
            }}
          >
            {/* العنوان والأيقونة */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <BusinessIcon sx={{ color: '#2e7d32', fontSize: 38 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 20 }}>
                  {service.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: 14 }}
                >
                  {service.city}
                </Typography>
              </Box>
            </Box>

            {/* الوصف */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                fontSize: 15,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {service.description}
            </Typography>

            {/* Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              <Chip
                icon={<PriceIcon />}
                label={`${service.price} ج.م`}
                variant="outlined"
                color="primary"
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={service.is_active ? 'نشطة' : 'معطلة'}
                color={service.is_active ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            {/* الأزرار */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
              <Tooltip title={service.is_active ? 'تعطيل الخدمة' : 'تفعيل الخدمة'}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={service.is_active ? <DeleteIcon /> : <EditIcon />}
                  onClick={() => handleToggleActive(service.id)}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    background: service.is_active ? '#f44336' : '#4caf50',
                    '&:hover': {
                      background: service.is_active ? '#d32f2f' : '#388e3c',
                    },
                  }}
                >
                  {service.is_active ? 'تعطيل' : 'تفعيل'}
                </Button>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default ServicesPage;
