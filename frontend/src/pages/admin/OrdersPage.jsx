import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  Avatar,
  useTheme,
  useMediaQuery,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Eye as ViewIcon,
  CheckCircle as CheckCircleIcon,
  X as CancelIcon,
  Menu as MenuIcon,
  Globe as GlobeIcon,
} from 'lucide-react';
import { ordersApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import '../../styles/adminCommon.css';
import './AdminDashboard.css';

const OrdersPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showSnackbar('خطأ في تحميل الطلبات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedOrder(null);
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setOpen(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateOrderStatus(orderId, { status: newStatus });
      showSnackbar('تم تحديث حالة الطلب بنجاح');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      showSnackbar('خطأ في تحديث حالة الطلب', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      try {
        await ordersApi.deleteOrder(id);
        showSnackbar('تم حذف الطلب بنجاح');
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        showSnackbar('خطأ في حذف الطلب', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' };
      case 'confirmed': return { bg: '#dbeafe', color: '#2563eb', border: '#3b82f6' };
      case 'in_progress': return { bg: '#f0f9ff', color: '#0077ff', border: '#0077ff' };
      case 'completed': return { bg: '#dcfce7', color: '#16a34a', border: '#22c55e' };
      case 'cancelled': return { bg: '#f3f4f6', color: '#6b7280', border: '#9ca3af' };
      default: return { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return t('pending');
      case 'confirmed': return t('confirmed');
      case 'in_progress': return t('in progress');
      case 'completed': return t('completed');
      case 'cancelled': return t('cancelled');
      default: return status;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* AdminHeader - الهيدر المشترك */}
      <AdminHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* AdminSidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* المحتوى الرئيسي */}
      <Box
        sx={{
          minHeight: '100vh',
          background: isDarkMode 
            ? 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)'
            : 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
          direction: 'rtl',
          overflowX: 'hidden',
          overflowY: 'auto',
          width: '100vw',
          mx: 'auto',
          px: { xs: 1, sm: 2 },
          pt: '56px',
          pl: sidebarOpen && !isMobile ? '180px' : 0,
          transform: sidebarOpen && !isMobile ? 'translateX(-180px)' : 'translateX(0)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <Box
          sx={{
            p: { xs: 1, sm: 1.5, md: 2 },
            maxWidth: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {/* Action Buttons */}
          <Grid container spacing={2} sx={{ mt: 2, mb: 3 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
                {/* <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 'bold', 
                    mb: 1, 
                    color: isDarkMode ? '#e5e7eb' : '#666666' 
                  }}>
                    {t('orders management')}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: isDarkMode ? '#9ca3af' : '#666666' 
                  }}>
                    {t('orders management description')}
                  </Typography>
                </Box> */}
              </Box>
            </Grid>
          </Grid>

          {/* Orders Cards */}
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={order.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,123,255,0.12)',
                    border: '1px solid rgba(0,123,255,0.15)',
                    background: isDarkMode 
                      ? 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(10,15,26,0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 12px 30px rgba(0,123,255,0.2)',
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Order Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      {/* <Typography variant="h6" sx={{ 
                        fontWeight: 600, 
                        color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                        fontSize: '1rem' 
                      }}>
                        طلب #{order.id}
                      </Typography> */}
                      <Chip
                        label={getStatusLabel(order.status)}
                        size="medium"
                        sx={{ 
                          borderRadius: '8px', 
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          backgroundColor: getStatusColor(order.status).bg,
                          color: getStatusColor(order.status).color,
                          border: `1px solid ${getStatusColor(order.status).border}`
                        }}
                      />
                    </Box>

                    {/* Order Details */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.9rem' 
                        }}>
                          {t('customer')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.9rem' 
                        }}>
                          {order.customer_name || t('not specified')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.9rem' 
                        }}>
                          {t('service')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.9rem' 
                        }}>
                          {order.service_name || t('not specified')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.9rem' 
                        }}>
                          {t('worker')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.9rem' 
                        }}>
                          {order.worker_name || t('not specified')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.9rem' 
                        }}>
                          {t('amount')}:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0077ff', fontSize: '0.9rem' }}>
                          {order.total_amount ? `${order.total_amount} ر.س` : t('not specified')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ 
                          color: isDarkMode ? '#9ca3af' : '#64748b', 
                          fontSize: '0.9rem' 
                        }}>
                          {t('date')}:
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDarkMode ? '#e5e7eb' : '#1e293b', 
                          fontSize: '0.9rem' 
                        }}>
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('ar-SA') : t('not specified')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap', mt: 2 }}>
                      {/* <Tooltip title="عرض التفاصيل">
                        <IconButton 
                          size="small"
                          onClick={() => handleView(order)} 
                          sx={{ 
                            color: '#0077ff',
                            '&:hover': { background: 'rgba(0,123,255,0.1)' }
                          }}
                        >
                          <ViewIcon size={16} />
                        </IconButton>
                      </Tooltip> */}
                      
                      {order.status === 'pending' && (
                        <>
                          <Tooltip title="تأكيد الطلب">
                            <IconButton 
                              size="medium"
                              onClick={() => handleUpdateStatus(order.id, 'confirmed')} 
                              sx={{ 
                                color: '#0077ff',
                                '&:hover': { background: 'rgba(0,123,255,0.1)' }
                              }}
                            >
                              <CheckCircleIcon size={20} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="إلغاء الطلب">
                            <IconButton 
                              size="medium"
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')} 
                              sx={{ 
                                color: '#6b7280',
                                '&:hover': { background: 'rgba(107,114,128,0.1)' }
                              }}
                            >
                              <CancelIcon size={20} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      
                      {order.status === 'confirmed' && (
                        <Tooltip title="بدء التنفيذ">
                          <IconButton 
                            size="medium"
                            onClick={() => handleUpdateStatus(order.id, 'in_progress')} 
                            sx={{ 
                              color: '#0077ff',
                              '&:hover': { background: 'rgba(0,123,255,0.1)' }
                            }}
                          >
                            <CheckCircleIcon size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {order.status === 'in_progress' && (
                        <Tooltip title="إكمال الطلب">
                          <IconButton 
                            size="medium"
                            onClick={() => handleUpdateStatus(order.id, 'completed')} 
                            sx={{ 
                              color: '#0077ff',
                              '&:hover': { background: 'rgba(0,123,255,0.1)' }
                            }}
                          >
                            <CheckCircleIcon size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="حذف">
                        <IconButton 
                          size="medium"
                          onClick={() => handleDelete(order.id)} 
                          sx={{ 
                            color: '#6b7280',
                            '&:hover': { background: 'rgba(107,114,128,0.1)' }
                          }}
                        >
                          <DeleteIcon size={20} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل الطلب</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                طلب #{selectedOrder.id}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>العميل:</Typography>
                  <Typography variant="body1">{selectedOrder.customer_name || 'غير محدد'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>الخدمة:</Typography>
                  <Typography variant="body1">{selectedOrder.service_name || 'غير محدد'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>العامل:</Typography>
                  <Typography variant="body1">{selectedOrder.worker_name || 'غير محدد'}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>المبلغ:</Typography>
                  <Typography variant="body1">
                    {selectedOrder.total_amount ? `${selectedOrder.total_amount} ر.س` : 'غير محدد'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>التاريخ:</Typography>
                  <Typography variant="body1">
                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>الحالة:</Typography>
                  <Chip
                    label={getStatusLabel(selectedOrder.status)}
                    color={getStatusColor(selectedOrder.status)}
                    size="small"
                  />
                </Box>
              </Box>
              {selectedOrder.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>ملاحظات:</Typography>
                  <Typography variant="body1">{selectedOrder.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>إغلاق</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OrdersPage;