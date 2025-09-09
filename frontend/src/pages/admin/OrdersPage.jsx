import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ordersApi, usersApi } from '../../services/adminApiService';
import '../../styles/adminCommon.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchOrders();
    fetchProviders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getOrders();
      const data = response.success ? response.data : [];
      setOrders(data);
    } catch (err) {
      setError('فشل في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await usersApi.getUsers();
      const data = response.success ? response.data : [];
      // Filter only workers/providers
      const workers = data.filter(user => user.role === 'worker');
      setProviders(workers);
    } catch (err) {
      console.error('فشل في تحميل مقدمي الخدمة:', err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersApi.setOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      setError('فشل في تحديث حالة الطلب');
    }
  };

  const handleAssignProvider = (order) => {
    setSelectedOrder(order);
    setSelectedProvider('');
    setAssignDialogOpen(true);
  };

  const handleConfirmAssignment = async () => {
    try {
      await ordersApi.assignProvider(selectedOrder.id, selectedProvider);
      setSnackbar({ open: true, message: 'تم تعيين مقدم الخدمة بنجاح', severity: 'success' });
      setAssignDialogOpen(false);
      fetchOrders();
    } catch (err) {
      setSnackbar({ open: true, message: 'فشل في تعيين مقدم الخدمة', severity: 'error' });
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
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

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'customer_name', headerName: 'العميل', width: 150 },
    { field: 'service_name', headerName: 'الخدمة', width: 200 },
    { field: 'offered_price', headerName: 'السعر المقترح', width: 120 },
    { field: 'scheduled_time', headerName: 'الوقت المحدد', width: 150 },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={getStatusLabel(params.value)}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={params.row.status}
              onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
            >
              <MenuItem value="pending">معلق</MenuItem>
              <MenuItem value="accepted">مقبول</MenuItem>
              <MenuItem value="completed">مكتمل</MenuItem>
              <MenuItem value="cancelled">ملغي</MenuItem>
            </Select>
          </FormControl>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => handleAssignProvider(params.row)}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            تعيين
          </Button>
        </Box>
      ),
    },
  ];

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
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>إدارة الطلبات</Typography>
        <Button
          variant="contained"
          startIcon={<AssignmentIcon />}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            px: 3,
            py: 1.2,
            background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
            boxShadow: '0 4px 16px #1976d233',
            transition: '0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #1565c0 60%, #1976d2 100%)',
              boxShadow: '0 8px 24px #1976d244',
            },
          }}
        >
          تقرير الطلبات
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
          {orders.map((order) => (
            <Paper
              key={order.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                boxShadow: '0 4px 24px #1976d222',
                background: '#fff',
                minHeight: 180,
                transition: 'box-shadow 0.22s, transform 0.22s',
                '&:hover': {
                  boxShadow: '0 8px 32px #1976d244',
                  transform: 'scale(1.025)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 1 }}>
                <AssignmentIcon sx={{ color: '#1976d2', fontSize: 40, boxShadow: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 22 }}>{order.customer_name}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: 16 }}>الخدمة: {order.service_name}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={getStatusLabel(order.status)} color={getStatusColor(order.status)} size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
                <Chip label={`سعر: ${order.offered_price}`} color="info" size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
                <Chip label={order.scheduled_time} color="default" size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => handleAssignProvider(order)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  تعيين مقدم خدمة
                </Button>
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

      {/* Provider Assignment Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تعيين مقدم خدمة للطلب</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              العميل: {selectedOrder?.customer_name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              الخدمة: {selectedOrder?.service_name}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  اختر مقدم الخدمة
                </MenuItem>
                {providers.map((provider) => (
                  <MenuItem key={provider.id} value={provider.id}>
                    {provider.username} ({provider.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleConfirmAssignment} 
            variant="contained"
            disabled={!selectedProvider}
          >
            تعيين
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersPage;
