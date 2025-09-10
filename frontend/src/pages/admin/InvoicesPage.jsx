import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Avatar,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Eye as ViewIcon,
  Download as DownloadIcon,
  Printer as PrintIcon,
  Receipt as ReceiptIcon,
  Menu as MenuIcon,
  Globe as GlobeIcon,
  Bell as BellIcon,
  DollarSign as DollarIcon,
  TrendingUp as TrendingUpIcon,
  CreditCard as CreditCardIcon,
  FileText as FileTextIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { invoicesApi, dashboardApi, notificationsApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import FinancialStats from '../../components/admin/FinancialStats';
import '../../styles/adminCommon.css';
import './AdminDashboard.css';

const InvoicesPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const [invoices, setInvoices] = useState([]);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [unreadCount, setUnreadCount] = useState(0);

  // تحديث حالة السايد بار عند تغيير حجم الشاشة
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    fetchInvoicesData();
  }, []);

  // جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    if (user) {
      fetchUnreadCount();
      // تحديث العدد كل 30 ثانية
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleNotificationsClick = () => {
    navigate('/admin/notifications');
  };

  const fetchInvoicesData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // جلب بيانات الفواتير
      const invoicesResponse = await invoicesApi.getInvoices();
      if (invoicesResponse.success) {
        setInvoices(invoicesResponse.data);
      } else {
        setError(invoicesResponse.error);
      }

      // جلب البيانات المالية
      const financialResponse = await dashboardApi.getFinancialReport();
      if (financialResponse.success) {
        setFinancialData(financialResponse.data);
      } else {
        setError(financialResponse.error);
      }
    } catch (err) {
      setError('خطأ في تحميل البيانات');
      console.error('Invoices data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedInvoice(null);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setOpen(true);
  };

  const handleDownload = async (invoiceId) => {
    try {
      await invoicesApi.downloadInvoice(invoiceId);
      showSnackbar('تم تحميل الفاتورة بنجاح');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showSnackbar('خطأ في تحميل الفاتورة', 'error');
    }
  };

  const handlePrint = async (invoiceId) => {
    try {
      await invoicesApi.printInvoice(invoiceId);
      showSnackbar('تم إرسال الفاتورة للطباعة');
    } catch (error) {
      console.error('Error printing invoice:', error);
      showSnackbar('خطأ في طباعة الفاتورة', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return { bg: '#dcfce7', color: '#16a34a', border: '#22c55e' };
      case 'pending': return { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' };
      case 'overdue': return { bg: '#f3f4f6', color: '#6b7280', border: '#9ca3af' };
      default: return { bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid': return t('paid');
      case 'pending': return t('pending');
      case 'overdue': return t('overdue');
      default: return status;
    }
  };

  // حساب الإحصائيات من البيانات المالية
  const totalAmount = financialData?.by_status?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalCount = financialData?.by_status?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  const paidAmount = financialData?.by_status?.find(item => item.status === 'paid')?.total || 0;
  const pendingAmount = financialData?.by_status?.find(item => item.status === 'pending')?.total || 0;
  const overdueCount = financialData?.by_status?.find(item => item.status === 'overdue')?.count || 0;
  
  // حساب النسبة المئوية لأرباح الموقع
  const websiteProfitRate = financialData?.profit_summary?.website_profit_rate || 
    (financialData?.profit_summary?.website_profit && totalAmount > 0 ? 
      Math.round((financialData.profit_summary.website_profit / totalAmount) * 100) : 5);

  // مكون بطاقة الإحصائيات
  const StatCard = ({ title, value, icon, iconColor, subtitle }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
          border: '1px solid rgba(0,123,255,0.1)',
          background: isDarkMode 
            ? 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(10,15,26,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
            {React.cloneElement(icon, { size: 20, color: iconColor })}
          </Box>
          <Typography variant="h4" component="div" sx={{ 
            fontWeight: 500, 
            color: isDarkMode ? '#e5e7eb' : '#666666', 
            fontSize: '1.2rem', 
            mb: 0.5 
          }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: isDarkMode ? '#9ca3af' : '#666666', 
            fontSize: '0.9rem', 
            fontWeight: 500 
          }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ 
              color: isDarkMode ? '#9ca3af' : '#666666', 
              fontSize: '0.8rem' 
            }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 2, color: isDarkMode ? '#e5e7eb' : '#666666' }}>
            {t('loading_data')}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          {t('retry')}
        </Button>
      </Box>
    );
  }

  return (
    <>
      {/* AppBar - الهيدر */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          background: isDarkMode 
            ? 'linear-gradient(135deg, #111827 0%, #0a0f1a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: '0 4px 20px rgba(0,123,255,0.3)',
          borderBottom: '1px solid rgba(0,123,255,0.2)',
          backdropFilter: 'blur(10px)',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        }}
      >
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          px: 3,
          minHeight: '56px !important',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #111827 0%, #0a0f1a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }}>
          {/* الجانب الأيسر - أيقونة المستخدم والدور */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: '#0077ff', 
                width: 38, 
                height: 38,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                letterSpacing: 1,
                boxShadow: '0 3px 10px rgba(0,123,255,0.3)',
                border: '2px solid rgba(0,123,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 5px 14px rgba(0,123,255,0.4)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: isDarkMode ? '#e5e7eb' : '#1e293b',
                  fontSize: '1rem',
                  letterSpacing: 0.5,
                  mb: 0.2
                }}
              >
                {user?.username || t('system_administrator')}
              </Typography>
            </Box>
          </Box>
          
          {/* الجانب الأيمن - أزرار التحكم */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* زر الإشعارات */}
            <Tooltip title={t('notifications')}>
              <IconButton
                onClick={handleNotificationsClick}
                sx={{ 
                  color: isDarkMode ? '#e5e7eb' : '#64748b',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  width: 36,
                  height: 36,
                  boxShadow: isDarkMode 
                    ? '0 2px 8px rgba(0,0,0,0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.1)',
                  border: isDarkMode 
                    ? '1px solid rgba(255,255,255,0.05)' 
                    : '1px solid rgba(0,0,0,0.08)',
                  '&:hover': {
                    background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.1)',
                    color: isDarkMode ? '#ffffff' : '#0077ff',
                    border: isDarkMode 
                      ? '1px solid rgba(255,255,255,0.2)' 
                      : '1px solid rgba(0,123,255,0.2)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Badge 
                  badgeContent={unreadCount} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      fontWeight: 'bold',
                    }
                  }}
                >
                  <BellIcon size={16} />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* زر اللغة */}
            <Box 
              onClick={toggleLanguage}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5, 
                cursor: 'pointer',
                px: 1.2,
                py: 0.4,
                borderRadius: 2,
                background: 'rgba(0,0,0,0.04)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.08)',
                '&:hover': {
                  backgroundColor: 'rgba(0,123,255,0.1)',
                  transform: 'scale(1.02)',
                  border: '1px solid rgba(0,123,255,0.2)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                {currentLang === 'ar' ? 'English' : 'عربي'}
              </Typography>
              <GlobeIcon size={12} color={isDarkMode ? '#9ca3af' : '#64748b'} />
            </Box>
            
            {/* زر البرجر منيو */}
            <IconButton
              sx={{ 
                bgcolor: '#0077ff',
                color: 'white',
                width: 36,
                height: 36,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,123,255,0.3)',
                boxShadow: '0 3px 10px rgba(0,123,255,0.3)',
                '&:hover': { 
                  backgroundColor: '#0056b3',
                  transform: 'scale(1.05)',
                  boxShadow: '0 5px 14px rgba(0,123,255,0.4)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MenuIcon size={16} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* AdminSidebar */}
      <AdminSidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content */}
      <Box
        className="admin-dashboard-container"
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
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: isDarkMode ? '#e5e7eb' : '#666666' }}>
                {t('invoices management')}
              </Typography>
              <Typography variant="body1" sx={{ color: isDarkMode ? '#9ca3af' : '#666666' }}>
                {t('invoices management description')}
              </Typography>
            </Box> */}
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('total invoices')}
                value={`${totalAmount.toLocaleString()} ${t('currency')}`}
                icon={<DollarIcon />}
                iconColor="#0077ff"
                subtitle={`${totalCount} ${t('invoice')}`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('paid invoices')}
                value={`${paidAmount.toLocaleString()} ${t('currency')}`}
                icon={<CreditCardIcon />}
                iconColor="#10b981"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('pending invoices')}
                value={`${pendingAmount.toLocaleString()} ${t('currency')}`}
                icon={<FileTextIcon />}
                iconColor="#f59e0b"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('overdue invoices')}
                value={overdueCount.toString()}
                icon={<CalendarIcon />}
                iconColor="#ef4444"
              />
            </Grid>
          </Grid>

          {/* Financial Stats - Full Width */}
          <Grid container spacing={4} sx={{ mb: 3 }}>
            <Grid size={12}>
              <FinancialStats websiteProfitRate={websiteProfitRate} />
            </Grid>
          </Grid>

          {/* Invoices Cards */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: 2.5,
            mt: 2
          }}>
            {invoices.filter(invoice => 
              // فلترة الفواتير التي تحتوي على بيانات صحيحة
              invoice.customer_name && 
              invoice.customer_name !== 'غير محدد' &&
              invoice.worker_name && 
              invoice.worker_name !== 'غير محدد' &&
              invoice.service_name && 
              invoice.service_name !== 'غير محدد' &&
              invoice.total_amount && 
              invoice.total_amount > 0
            ).map((invoice) => (
              <Card
                key={invoice.id}
                sx={{
                  minWidth: '280px',
                  maxWidth: '320px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
                  border: '1px solid rgba(0,123,255,0.1)',
                  background: isDarkMode 
                    ? 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(10,15,26,0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease-in-out',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,123,255,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Invoice Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.9rem' }}>
                      {t('invoice')} #{invoice.id}
                    </Typography>
                    <Chip
                      label={getStatusLabel(invoice.status)}
                      size="small"
                      sx={{ 
                        borderRadius: '6px', 
                        fontSize: '0.7rem',
                        backgroundColor: getStatusColor(invoice.status).bg,
                        color: getStatusColor(invoice.status).color,
                        border: `1px solid ${getStatusColor(invoice.status).border}`
                      }}
                    />
                  </Box>

                  {/* Invoice Details */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('order number')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        #{invoice.order_id || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('customer')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {invoice.customer_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('worker')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {invoice.worker_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('service')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {invoice.service_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('amount')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0077ff', fontSize: '0.8rem' }}>
                        {invoice.total_amount ? `${invoice.total_amount} ${t('currency')}` : t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('date')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('ar-SA') : t('not specified')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 'auto' }}>
                    <Tooltip title={t('view invoice')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleView(invoice)} 
                        sx={{ 
                          color: '#0077ff',
                          '&:hover': { background: 'rgba(0,123,255,0.1)' }
                        }}
                      >
                        <ViewIcon size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('download')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleDownload(invoice.id)} 
                        sx={{ 
                          color: '#0077ff',
                          '&:hover': { background: 'rgba(0,123,255,0.1)' }
                        }}
                      >
                        <DownloadIcon size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('print')}>
                      <IconButton 
                        size="small"
                        onClick={() => handlePrint(invoice.id)} 
                        sx={{ 
                          color: '#6b7280',
                          '&:hover': { background: 'rgba(107,114,128,0.1)' }
                        }}
                      >
                        <PrintIcon size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* No Results Message */}
          {invoices && invoices.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ color: isDarkMode ? '#e5e7eb' : '#666666', mb: 1 }}>
                {t('no results')}
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#999999' }}>
                {t('no invoices found')}
              </Typography>
            </Box>
          )}

        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
          {t('invoice details')}
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                    {t('invoice information')}
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('invoice number')}:
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                        #{selectedInvoice.id}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('order number')}:
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                        #{selectedInvoice.order_id || t('not specified')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('date')}:
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                        {selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleDateString('ar-SA') : t('not specified')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('status')}:
                      </Typography>
                      <Chip
                        label={getStatusLabel(selectedInvoice.status)}
                        sx={{
                          backgroundColor: getStatusColor(selectedInvoice.status).bg,
                          color: getStatusColor(selectedInvoice.status).color,
                          border: `1px solid ${getStatusColor(selectedInvoice.status).border}`
                        }}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ mb: 2, color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                    {t('service details')}
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('customer')}:
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                        {selectedInvoice.customer_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('worker')}:
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                        {selectedInvoice.worker_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('service')}:
                      </Typography>
                      <Typography variant="body1" sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                        {selectedInvoice.service_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666' }}>
                        {t('total amount')}:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#0077ff' }}>
                        {selectedInvoice.total_amount ? `${selectedInvoice.total_amount} ${t('currency')}` : t('not specified')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                {selectedInvoice.notes && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                      {t('notes')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
                      {selectedInvoice.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: isDarkMode ? '#e5e7eb' : '#1e293b' }}>
            {t('close')}
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => handleDownload(selectedInvoice?.id)}>
            {t('download')}
          </Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => handlePrint(selectedInvoice?.id)}>
            {t('print')}
          </Button>
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

export default InvoicesPage;
