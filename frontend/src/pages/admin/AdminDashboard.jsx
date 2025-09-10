import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  DollarSign as DollarIcon,
  Calendar as CalendarIcon,
  Home as HomeIcon,
  Wrench as BuildIcon,
  Users as UsersIcon,
  TrendingUp as TrendingUpIcon,
  Globe as GlobeIcon,
  Menu as MenuIcon,
  Bell as BellIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { dashboardApi, notificationsApi } from '../../services/adminApiService';
import GrowthChart from '../../components/admin/GrowthChart';
import FinancialStats from '../../components/admin/FinancialStats';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import './AdminDashboard.css';


export default function AdminDashboard() {
  const navigate = useNavigate();
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const statsResponse = await dashboardApi.getStats();
        if (statsResponse.success) {
          setStats(statsResponse.data);
        } else {
          setError(statsResponse.error);
        }

        const ordersResponse = await dashboardApi.getRecentOrders();
        if (ordersResponse.success) {
          setRecentOrders(ordersResponse.data);
        } else {
          setError(ordersResponse.error);
        }
      } catch (err) {
        setError('خطأ في تحميل البيانات');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateGrowthRate = () => {
    if (!stats) return 0;
    return Math.round((stats.bookings_count / Math.max(stats.users_count, 1)) * 10);
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'black', backgroundColor: '#FFF3E0', label: t('pending') },
      confirmed: { color: 'black', backgroundColor: '#E3F2FD', label: t('confirmed') },
      completed: { color: 'black', backgroundColor: '#E8F5E8', label: t('completed') }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        label={config.label}
        sx={{
          backgroundColor: config.backgroundColor,
          color: config.color,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px',
          '& .MuiChip-label': { px: 1.5 }
        }}
      />
    );
  };

  const handleExportReport = () => {
    const reportData = {
      stats: stats,
      recentOrders: recentOrders,
      generatedAt: new Date().toLocaleString('ar-SA')
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSuccessMessage('تم تصدير التقرير بنجاح');
    setSuccessSnackbarOpen(true);
  };

  const StatCard = ({ title, value, icon, iconColor, subtitle }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card
        sx={{
          height: '100%',
          borderRadius: '12px',
          boxShadow: isDarkMode 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,123,255,0.08)',
          border: isDarkMode 
            ? '1px solid #374151' 
            : '1px solid rgba(0,123,255,0.1)',
          background: isDarkMode
            ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CardContent sx={{ p: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
            {React.cloneElement(icon, { size: 20, color: iconColor })}
          </Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 500, color: isDarkMode ? '#f9fafb' : '#666666', fontSize: '1.2rem', mb: 0.5 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#666666', fontSize: '0.9rem', fontWeight: 500 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: isDarkMode ? '#6b7280' : '#666666', fontSize: '0.8rem' }}>
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
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 2, color: '#666666' }}>
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
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.4)'
            : '0 4px 20px rgba(0,123,255,0.3)',
          borderBottom: isDarkMode
            ? '1px solid #1f2937'
            : '1px solid rgba(0,123,255,0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            px: 3,
            minHeight: '56px !important',
          }}
        >
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
                boxShadow: isDarkMode
                  ? '0 3px 10px rgba(0,123,255,0.4)'
                  : '0 3px 10px rgba(0,123,255,0.3)',
                border: isDarkMode
                  ? '2px solid rgba(0,123,255,0.3)'
                  : '2px solid rgba(0,123,255,0.2)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: isDarkMode
                    ? '0 5px 14px rgba(0,123,255,0.5)'
                    : '0 5px 14px rgba(0,123,255,0.4)',
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
                  mb: 0.2,
                }}
              >
                {user?.username || t('system administrator')}
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

            {/* زر تغيير اللغة */}
            <Box
              onClick={toggleLanguage}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.5,
                borderRadius: '6px',
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,123,255,0.1)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,123,255,0.2)',
                  transform: 'scale(1.02)',
                },
              }}
            >
              <GlobeIcon size={14} color={isDarkMode ? '#f1f5f9' : '#64748b'} />
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isDarkMode ? '#f1f5f9' : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {currentLang === 'ar' ? 'English' : 'عربي'}
              </Typography>
            </Box>

            {/* زر السايد بار */}
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                color: isDarkMode ? '#f1f5f9' : '#64748b',
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.04)',
                width: 36,
                height: 36,
                boxShadow: isDarkMode
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
                border: isDarkMode
                  ? '1px solid rgba(255,255,255,0.1)'
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
              <MenuIcon size={16} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* AdminSidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <Box
        className="admin-dashboard-container"
        sx={{
          minHeight: '100vh',
          background: isDarkMode
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
          direction: 'rtl',
          overflowX: 'hidden',
          overflowY: 'auto',
        //   maxWidth: '1200px',
        width: '100vw',
          mx: 'auto',
          px: { xs: 1, sm: 2 },
          pt: '56px',
          pl: sidebarOpen && !isMobile ? '280px' : 0,
          transform: sidebarOpen && !isMobile ? 'translateX(-280px)' : 'translateX(0)',
          transition: 'all 0.3s ease-in-out',
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
          {/* Header Section */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f9fafb' : '#1e293b',
                  mb: 1,
                  fontSize: '2rem',
                }}
              >
                {t('dashboard')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isDarkMode ? '#9ca3af' : '#64748b',
                  fontSize: '1rem',
                }}
              >
                {t('welcome back')}, {user?.username || t('administrator')}
              </Typography>
            </Box> */}
            
            {/* أزرار الإعدادات والتقرير */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/admin/settings')}
                sx={{
                  borderRadius: '8px',
                  borderColor: isDarkMode ? '#374151' : '#E0E0E0',
                  color: isDarkMode ? '#e5e7eb' : 'black',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  py: 0.8,
                  fontSize: '0.85rem',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'transparent',
                  '&:hover': {
                    borderColor: '#0077ff',
                    color: '#0077ff',
                    backgroundColor: isDarkMode ? 'rgba(0, 119, 255, 0.1)' : 'rgba(0, 119, 255, 0.05)'
                  }
                }}
              >
                {t('settings_button')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportReport}
                sx={{
                  borderRadius: '8px',
                  borderColor: isDarkMode ? '#374151' : '#E0E0E0',
                  color: isDarkMode ? '#e5e7eb' : 'black',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 2,
                  py: 0.8,
                  fontSize: '0.85rem',
                  background: isDarkMode ? 'rgba(255,255,255,0.05)' : 'transparent',
                  '&:hover': {
                    borderColor: '#10b981',
                    color: '#10b981',
                    backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)'
                  }
                }}
              >
                {t('export_report')}
              </Button>
            </Box>
          </Box>

          {/* Statistics Cards - عمود واحد */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title={t('average_rating')}
                value={stats?.avg_rating?.toFixed(1) || '0.0'}
                icon={<StarIcon />}
                iconColor="#f97316"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title={t('total_invoices')}
                value={stats?.invoices_count?.toLocaleString() || '0'}
                icon={<DollarIcon />}
                iconColor="#ef4444"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title={t('total_bookings')}
                value={stats?.bookings_count?.toLocaleString() || '0'}
                icon={<CalendarIcon />}
                iconColor="#f59e0b"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title={t('customers')}
                value={stats?.users_count?.toLocaleString() || '0'}
                icon={<HomeIcon />}
                iconColor="#10b981"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title={t('services_count')}
                value={stats?.services_count?.toLocaleString() || '0'}
                icon={<BuildIcon />}
                iconColor="#3b82f6"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title={t('orders_count')}
                value={stats?.orders_count?.toLocaleString() || '0'}
                icon={<UsersIcon />}
                iconColor="#0077ff"
              />
            </Grid>
          </Grid>





          {/* Chart + System Status */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Chart */}
            <Grid item xs={12} md={8}>
              <GrowthChart />
            </Grid>

            {/* System Status */}
            <Grid item xs={12} md={4}>
              {/* حالة النظام */}
              <Card sx={{ 
                p: 1.5, 
                height: '100%',
                width: '40vw',
                borderRadius: '12px',
                boxShadow: isDarkMode 
                  ? '0 2px 8px rgba(0,0,0,0.3)' 
                  : '0 2px 8px rgba(0,123,255,0.08)',
                border: isDarkMode 
                  ? '1px solid #374151' 
                  : '1px solid rgba(0,123,255,0.1)',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: isDarkMode ? '#f9fafb' : '#666666' }}>
                  {t('system_status')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', p: 1.5, border: isDarkMode ? '1px solid #374151' : '1px solid #ddd', borderRadius: '8px' }}>
                    <Typography sx={{ fontWeight: 600, color: isDarkMode ? '#e5e7eb' : '#666666' }}>{t('active_services')}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography sx={{ fontWeight: 600, color: isDarkMode ? '#e5e7eb' : '#666666' }}>{stats?.services_count || 0}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', p: 1.5, border: isDarkMode ? '1px solid #374151' : '1px solid #ddd', borderRadius: '8px' }}>
                    <Typography sx={{ fontWeight: 600, color: isDarkMode ? '#e5e7eb' : '#666666' }}>{t('pending_bookings')}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography sx={{ fontWeight: 600, color: isDarkMode ? '#e5e7eb' : '#666666' }}>{stats?.bookings_status?.pending || 0}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Financial Statistics - Full Width */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <FinancialStats />
            </Grid>
          </Grid>

          {/* Recent Bookings - Full Width */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <Card sx={{ 
                width: '95vw',
                p: 1.5,
                borderRadius: '12px',
                boxShadow: isDarkMode 
                  ? '0 2px 8px rgba(0,0,0,0.3)' 
                  : '0 2px 8px rgba(0,123,255,0.08)',
                border: isDarkMode 
                  ? '1px solid #374151' 
                  : '1px solid rgba(0,123,255,0.1)',
                background: isDarkMode
                  ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
                backdropFilter: 'blur(10px)'
              }}>
                <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: isDarkMode ? '#f9fafb' : '#666666' }}>
                  {t('recent_bookings')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <Box
                        key={order.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          border: isDarkMode ? '1px solid #374151' : '1px solid #ddd',
                          borderRadius: '8px',
                          width: '100%'
                        }}
                      >
                        {/* الخدمة + اسم العميل */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography sx={{ fontSize: '0.9rem', color: isDarkMode ? '#e5e7eb' : '#666666' }}>{order.user || t('undefined_user')}</Typography>
                        </Box>
                        {/* الحالة */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getStatusChip(order.status)}
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography sx={{ color: isDarkMode ? '#9ca3af' : '#666666' }}>{t('no_recent_orders')}</Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>


</Box>
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={successSnackbarOpen} autoHideDuration={4000} onClose={() => setSuccessSnackbarOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSuccessSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
