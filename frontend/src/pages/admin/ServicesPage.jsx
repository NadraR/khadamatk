import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { servicesApi } from '../../services/adminApiService';
import '../../styles/adminCommon.css';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesApi.getServices();
      if (response.success) {
        const data = response.data;
        setServices(data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('فشل في تحميل الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (serviceId) => {
    try {
      const response = await servicesApi.toggleServiceActive(serviceId);
      if (response.success) {
        fetchServices();
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('فشل في تحديث حالة الخدمة');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'title', headerName: 'عنوان الخدمة', width: 200 },
    { field: 'description', headerName: 'الوصف', width: 300 },
    { field: 'city', headerName: 'المدينة', width: 120 },
    { field: 'price', headerName: 'السعر', width: 100 },
    {
      field: 'is_active',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'نشط' : 'معطل'}
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleToggleActive(params.row.id)}
            title={params.row.is_active ? 'تعطيل' : 'تفعيل'}
          >
            {params.row.is_active ? <DeleteIcon /> : <EditIcon />}
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          جاري تحميل الخدمات...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>إدارة الخدمات</Typography>
        <Button
          variant="contained"
          startIcon={<BusinessIcon />}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            px: 3,
            py: 1.2,
            background: 'linear-gradient(90deg, #388e3c 60%, #81c784 100%)',
            boxShadow: '0 4px 16px #388e3c33',
            transition: '0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #2e7d32 60%, #388e3c 100%)',
              boxShadow: '0 8px 24px #388e3c44',
            },
          }}
        >
          إضافة خدمة جديدة
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2.2,
        }}>
          {services.map((service) => (
            <Paper
              key={service.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                boxShadow: '0 4px 24px #388e3c22',
                background: '#fff',
                minHeight: 180,
                transition: 'box-shadow 0.22s, transform 0.22s',
                '&:hover': {
                  boxShadow: '0 8px 32px #388e3c44',
                  transform: 'scale(1.025)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 1 }}>
                <BusinessIcon sx={{ color: '#388e3c', fontSize: 40, boxShadow: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 22 }}>{service.title}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: 16 }}>{service.city} - {service.price} ج.م</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1, minHeight: 36, fontSize: 16 }}>
                {service.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={service.is_active ? 'نشطة' : 'معطلة'} color={service.is_active ? 'success' : 'error'} size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="contained"
                  color={service.is_active ? 'error' : 'success'}
                  startIcon={service.is_active ? <DeleteIcon /> : <EditIcon />}
                  onClick={() => handleToggleActive(service.id)}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 2, fontSize: 15, boxShadow: service.is_active ? '0 2px 8px #e5393522' : '0 2px 8px #43a04722' }}
                >
                  {service.is_active ? 'تعطيل' : 'تفعيل'}
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ServicesPage;