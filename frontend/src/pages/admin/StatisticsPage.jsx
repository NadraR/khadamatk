import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
} from '@mui/material';
import {
  BarChart3 as BarChartIcon,
  Menu as MenuIcon,
  Globe as GlobeIcon,
  Bell as BellIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Users as UsersIcon,
  DollarSign as DollarIcon,
  Star as StarIcon,
  MessageSquare as MessageSquareIcon,
  Calendar as CalendarIcon,
  Activity as ActivityIcon,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target as TargetIcon,
  Award as AwardIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertCircle as AlertCircleIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { dashboardApi, usersApi, servicesApi, ordersApi, invoicesApi, ratingsApi, reviewsApi, notificationsApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import '../../styles/adminCommon.css';
import './AdminDashboard.css';

const StatisticsPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // البيانات الإحصائية
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [reviews, setReviews] = useState([]);

  // تحديث حالة السايد بار عند تغيير حجم الشاشة
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    fetchAllData();
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

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // جلب جميع البيانات بالتوازي
      const [
        statsResponse,
        usersResponse,
        servicesResponse,
        ordersResponse,
        invoicesResponse,
        ratingsResponse,
        reviewsResponse
      ] = await Promise.all([
        dashboardApi.getStats(),
        usersApi.getUsers(),
        servicesApi.getServices(),
        ordersApi.getOrders(),
        invoicesApi.getInvoices(),
        ratingsApi.getRatings(),
        reviewsApi.getReviews()
      ]);

      // معالجة الاستجابات
      if (statsResponse.success) setStats(statsResponse.data);
      if (usersResponse.success) setUsers(usersResponse.data || []);
      if (servicesResponse.success) setServices(servicesResponse.data || []);
      if (ordersResponse.success) setOrders(ordersResponse.data || []);
      if (invoicesResponse.success) setInvoices(invoicesResponse.data || []);
      if (ratingsResponse.success) setRatings(ratingsResponse.data || []);
      if (reviewsResponse.success) setReviews(reviewsResponse.data || []);

    } catch (err) {
      setError('خطأ في تحميل البيانات الإحصائية');
      console.error('Statistics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // حساب الإحصائيات التفصيلية
  const calculateDetailedStats = () => {
    if (!stats) return {};

    // إحصائيات المستخدمين
    const totalUsers = users.length;
    const activeUsers = users.filter(user => user.is_active).length;
    const verifiedUsers = users.filter(user => user.is_verified).length;
    const staffUsers = users.filter(user => user.user_type === 'staff').length;
    const clientUsers = users.filter(user => user.user_type === 'client').length;

    // إحصائيات الخدمات
    const totalServices = services.length;
    const activeServices = services.filter(service => service.is_active).length;
    const customServices = services.filter(service => service.name === 'خدمة مخصصة').length;

    // إحصائيات الطلبات
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;

    // إحصائيات الفواتير
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
    const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending').length;
    const overdueInvoices = invoices.filter(invoice => invoice.status === 'overdue').length;
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0);

    // إحصائيات التقييمات
    const totalRatings = ratings.length;
    const averageRating = ratings.length > 0 ? 
      (ratings.reduce((sum, rating) => sum + (rating.score || 0), 0) / ratings.length).toFixed(1) : 0;
    const fiveStarRatings = ratings.filter(rating => rating.score === 5).length;
    const fourStarRatings = ratings.filter(rating => rating.score === 4).length;

    // إحصائيات المراجعات
    const totalReviews = reviews.length;
    const averageReviewRating = reviews.length > 0 ? 
      (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1) : 0;

    return {
      users: { total: totalUsers, active: activeUsers, verified: verifiedUsers, staff: staffUsers, client: clientUsers },
      services: { total: totalServices, active: activeServices, custom: customServices },
      orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders, cancelled: cancelledOrders },
      invoices: { total: totalInvoices, paid: paidInvoices, pending: pendingInvoices, overdue: overdueInvoices, revenue: totalRevenue },
      ratings: { total: totalRatings, average: averageRating, fiveStar: fiveStarRatings, fourStar: fourStarRatings },
      reviews: { total: totalReviews, average: averageReviewRating }
    };
  };

  const detailedStats = calculateDetailedStats();

  // مكون بطاقة الإحصائيات
  const StatCard = ({ title, value, icon, iconColor, subtitle, trend, trendValue }) => (
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
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
              {trend === 'up' ? (
                <TrendingUpIcon size={12} color="#10b981" />
              ) : (
                <TrendingDownIcon size={12} color="#ef4444" />
              )}
              <Typography variant="caption" sx={{ 
                color: trend === 'up' ? '#10b981' : '#ef4444',
                fontSize: '0.7rem',
                ml: 0.5
              }}>
                {trendValue}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // مكون جدول الإحصائيات
  const StatsTable = ({ title, data, columns }) => (
    <Card sx={{ 
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
      border: '1px solid rgba(0,123,255,0.1)',
      background: isDarkMode 
        ? 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(10,15,26,0.9) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      <CardContent>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          color: isDarkMode ? '#e5e7eb' : '#1e293b',
          mb: 2
        }}>
          {title}
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell key={index} sx={{ 
                    fontWeight: 600, 
                    color: isDarkMode ? '#9ca3af' : '#64748b',
                    borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                  }}>
                    {column}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <TableCell key={cellIndex} sx={{ 
                      color: isDarkMode ? '#e5e7eb' : '#1e293b',
                      borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                    }}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
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
                {t('detailed statistics')}
              </Typography>
              <Typography variant="body1" sx={{ color: isDarkMode ? '#9ca3af' : '#666666' }}>
                {t('detailed statistics description')}
              </Typography>
            </Box> */}
            <Button 
              variant="contained" 
              startIcon={<BarChartIcon size={16} />}
              onClick={fetchAllData}
              sx={{ 
                background: 'linear-gradient(135deg, #0077ff 0%, #0056b3 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #0056b3 0%, #004085 100%)' }
              }}
            >
              {t('refresh data')}
            </Button>
          </Box>

          {/* إحصائيات المستخدمين */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#e5e7eb' : '#1e293b',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <UsersIcon size={24} color="#0077ff" />
              {t('users statistics')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('total users')}
                  value={detailedStats.users?.total || 0}
                  icon={<UsersIcon />}
                  iconColor="#0077ff"
                  subtitle={t('registered users')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('active users')}
                  value={detailedStats.users?.active || 0}
                  icon={<CheckCircleIcon />}
                  iconColor="#10b981"
                  subtitle={t('currently active')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('verified users')}
                  value={detailedStats.users?.verified || 0}
                  icon={<AwardIcon />}
                  iconColor="#f59e0b"
                  subtitle={t('verified accounts')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('staff members')}
                  value={detailedStats.users?.staff || 0}
                  icon={<TargetIcon />}
                  iconColor="#8b5cf6"
                  subtitle={t('system staff')}
                />
              </Grid>
            </Grid>
          </Box>

          {/* إحصائيات الخدمات */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#e5e7eb' : '#1e293b',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <ActivityIcon size={24} color="#10b981" />
              {t('services statistics')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title={t('total services')}
                  value={detailedStats.services?.total || 0}
                  icon={<ActivityIcon />}
                  iconColor="#10b981"
                  subtitle={t('available services')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title={t('active services')}
                  value={detailedStats.services?.active || 0}
                  icon={<CheckCircleIcon />}
                  iconColor="#10b981"
                  subtitle={t('currently active')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <StatCard
                  title={t('custom services')}
                  value={detailedStats.services?.custom || 0}
                  icon={<TargetIcon />}
                  iconColor="#f59e0b"
                  subtitle={t('custom requests')}
                />
              </Grid>
            </Grid>
          </Box>

          {/* إحصائيات الطلبات */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#e5e7eb' : '#1e293b',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <CalendarIcon size={24} color="#f59e0b" />
              {t('orders statistics')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('total orders')}
                  value={detailedStats.orders?.total || 0}
                  icon={<CalendarIcon />}
                  iconColor="#f59e0b"
                  subtitle={t('all orders')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('pending orders')}
                  value={detailedStats.orders?.pending || 0}
                  icon={<ClockIcon />}
                  iconColor="#f59e0b"
                  subtitle={t('awaiting processing')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('completed orders')}
                  value={detailedStats.orders?.completed || 0}
                  icon={<CheckCircleIcon />}
                  iconColor="#10b981"
                  subtitle={t('successfully completed')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('cancelled orders')}
                  value={detailedStats.orders?.cancelled || 0}
                  icon={<XCircleIcon />}
                  iconColor="#ef4444"
                  subtitle={t('cancelled requests')}
                />
              </Grid>
            </Grid>
          </Box>

          {/* إحصائيات الفواتير والإيرادات */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#e5e7eb' : '#1e293b',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <DollarIcon size={24} color="#10b981" />
              {t('financial statistics')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('total revenue')}
                  value={`${(detailedStats.invoices?.revenue || 0).toLocaleString()} ${t('currency')}`}
                  icon={<DollarIcon />}
                  iconColor="#10b981"
                  subtitle={t('total income')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('paid invoices')}
                  value={detailedStats.invoices?.paid || 0}
                  icon={<CheckCircleIcon />}
                  iconColor="#10b981"
                  subtitle={t('successfully paid')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('pending invoices')}
                  value={detailedStats.invoices?.pending || 0}
                  icon={<ClockIcon />}
                  iconColor="#f59e0b"
                  subtitle={t('awaiting payment')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('overdue invoices')}
                  value={detailedStats.invoices?.overdue || 0}
                  icon={<AlertCircleIcon />}
                  iconColor="#ef4444"
                  subtitle={t('overdue payments')}
                />
              </Grid>
            </Grid>
          </Box>

          {/* إحصائيات التقييمات والمراجعات */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              color: isDarkMode ? '#e5e7eb' : '#1e293b',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <StarIcon size={24} color="#f59e0b" />
              {t('ratings and reviews')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('total ratings')}
                  value={detailedStats.ratings?.total || 0}
                  icon={<StarIcon />}
                  iconColor="#f59e0b"
                  subtitle={t('user ratings')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('average rating')}
                  value={detailedStats.ratings?.average || 0}
                  icon={<TrendingUpIcon />}
                  iconColor="#10b981"
                  subtitle={t('out of 5')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('five star ratings')}
                  value={detailedStats.ratings?.fiveStar || 0}
                  icon={<AwardIcon />}
                  iconColor="#f59e0b"
                  subtitle={t('excellent ratings')}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title={t('total reviews')}
                  value={detailedStats.reviews?.total || 0}
                  icon={<MessageSquareIcon />}
                  iconColor="#8b5cf6"
                  subtitle={t('text reviews')}
                />
              </Grid>
            </Grid>
          </Box>

          {/* جداول تفصيلية */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatsTable
                title={t('users breakdown')}
                data={[
                  { type: t('staff members'), count: detailedStats.users?.staff || 0, percentage: `${((detailedStats.users?.staff || 0) / (detailedStats.users?.total || 1) * 100).toFixed(1)}%` },
                  { type: t('clients'), count: detailedStats.users?.client || 0, percentage: `${((detailedStats.users?.client || 0) / (detailedStats.users?.total || 1) * 100).toFixed(1)}%` },
                  { type: t('active users'), count: detailedStats.users?.active || 0, percentage: `${((detailedStats.users?.active || 0) / (detailedStats.users?.total || 1) * 100).toFixed(1)}%` },
                  { type: t('verified users'), count: detailedStats.users?.verified || 0, percentage: `${((detailedStats.users?.verified || 0) / (detailedStats.users?.total || 1) * 100).toFixed(1)}%` }
                ]}
                columns={[t('user type'), t('count'), t('percentage')]}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatsTable
                title={t('orders breakdown')}
                data={[
                  { status: t('pending'), count: detailedStats.orders?.pending || 0, percentage: `${((detailedStats.orders?.pending || 0) / (detailedStats.orders?.total || 1) * 100).toFixed(1)}%` },
                  { status: t('completed'), count: detailedStats.orders?.completed || 0, percentage: `${((detailedStats.orders?.completed || 0) / (detailedStats.orders?.total || 1) * 100).toFixed(1)}%` },
                  { status: t('cancelled'), count: detailedStats.orders?.cancelled || 0, percentage: `${((detailedStats.orders?.cancelled || 0) / (detailedStats.orders?.total || 1) * 100).toFixed(1)}%` }
                ]}
                columns={[t('status'), t('count'), t('percentage')]}
              />
            </Grid>
          </Grid>

        </Box>
      </Box>

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

export default StatisticsPage;
