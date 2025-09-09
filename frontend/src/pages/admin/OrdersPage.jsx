// src/pages/admin/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { adminApiService } from '../../services/adminApiService';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await adminApiService.getOrders();
      setOrders(data);
    } catch {
      setError('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminApiService.setOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch {
      setError('فشل في تحديث حالة الطلب');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'accepted': return 'مقبول';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          جاري تحميل الطلبات...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: '#1976d2',
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '2px solid #90caf9',
          bgcolor: '#e3f2fd',
        }}
        textAlign="center"
      >
        إدارة الطلبات
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3,
        }}
      >
        {orders.map((order) => (
          <Paper
            key={order.id}
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              background: '#f0f7ff', // لون خلفية خفيف
              border: '1px solid #90caf9',
              boxShadow: '0 4px 12px rgba(33,150,243,0.1)',
              transition: '0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 25px rgba(33,150,243,0.2)',
              },
            }}
          >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AssignmentIcon sx={{ fontSize: 40, color: '#1976d2' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {order.customer_name}
              </Typography>
            </Box>

            {/* الخدمة والسعر والوقت */}
            <Typography variant="body2" color="text.secondary">
              الخدمة: {order.service_name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={getStatusLabel(order.status)}
                color={getStatusColor(order.status)}
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={`السعر: ${order.offered_price}`}
                color="info"
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={order.scheduled_time}
                color="default"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            {/* تعديل الحالة */}
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                >
                  <MenuItem value="pending">معلق</MenuItem>
                  <MenuItem value="accepted">مقبول</MenuItem>
                  <MenuItem value="completed">مكتمل</MenuItem>
                  <MenuItem value="cancelled">ملغي</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default OrdersPage;
