// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import './AdminDashboard.css';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Skeleton,
  Chip,
  Divider,
  Fade,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Assignment as AssignmentIcon,
  Star as StarIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { adminApiService } from '../../services/adminApiService';

// مكون مساعد لعرض نسبة التغيير
const TrendIndicator = ({ value, isPositive }) => (
  <span className={isPositive ? 'trend-positive' : 'trend-negative'}>
    {isPositive ? '+' : ''}{value}
  </span>
);

// مكون الهيكل العظمي للتحميل
const LoadingSkeleton = () => (
  <Container maxWidth="xl" sx={{ p: { xs: 1, md: 2 } }}>
    <Box sx={{ mb: 3 }}>
      <Skeleton variant="text" width="30%" height={60} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={30} />
    </Box>
    <Grid container spacing={2}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Skeleton variant="rectangular" height={340} sx={{ borderRadius: 2 }} />
      </Grid>
    </Grid>
  </Container>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const data = await adminApiService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('فشل في تحميل الإحصائيات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  if (loading) {
    return <LoadingSkeleton />;
  }
  
  if (error && !stats) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Chip
              icon={<RefreshIcon />}
              label="إعادة المحاولة"
              onClick={handleRefresh}
              color="error"
              variant="outlined"
              clickable
            />
          }
        >
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <ErrorIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="textSecondary">
            لوحة التحكم
          </Typography>
          <Typography variant="body1" color="textSecondary">
            مرحباً بك في لوحة التحكم الإدارية. يبدو أن هناك مشكلة في الاتصال بالخادم.
          </Typography>
        </Box>
      </Container>
    );
  } 

  const statCards = [
    {
      title: 'مقدمو الخدمة النشطون',
      value: stats?.services_count || 0,
      icon: <PeopleIcon />,
      iconClass: 'icon-purple',
      trend: '+45',
      trendUp: true
    },
    {
      title: 'إجمالي الطلبات',
      value: stats?.orders_count || 0,
      icon: <MoneyIcon />,
      iconClass: 'icon-orange',
      trend: '+18%',
      trendUp: true
    },
    {
      title: 'إجمالي الحجوزات',
      value: stats?.bookings_count || 0,
      icon: <AssignmentIcon />,
      iconClass: 'icon-green',
      trend: '+156',
      trendUp: true
    },
    {
      title: 'إجمالي المستخدمين',
      value: stats?.users_count || 0,
      icon: <PersonIcon />,
      iconClass: 'icon-blue',
      trend: '+234',
      trendUp: true
    }
  ];

  // تجهيز بيانات الرسم البياني من الـ API
  const ordersChartData = [
    { 
      name: 'معلق', 
      value: stats?.orders_status?.pending || 0,
      color: '#e67e22',
      percentage: stats?.orders_count ? ((stats?.orders_status?.pending || 0) / stats.orders_count * 100).toFixed(1) : '0'
    },
    { 
      name: 'مقبول', 
      value: stats?.orders_status?.accepted || 0,
      color: '#2980b9',
      percentage: stats?.orders_count ? ((stats?.orders_status?.accepted || 0) / stats.orders_count * 100).toFixed(1) : '0'
    },
    { 
      name: 'مكتمل', 
      value: stats?.orders_status?.completed || 0,
      color: '#27ae60',
      percentage: stats?.orders_count ? ((stats?.orders_status?.completed || 0) / stats.orders_count * 100).toFixed(1) : '0'
    },
    { 
      name: 'ملغي', 
      value: stats?.orders_status?.cancelled || 0,
      color: '#c0392b',
      percentage: stats?.orders_count ? ((stats?.orders_status?.cancelled || 0) / stats.orders_count * 100).toFixed(1) : '0'
    }
  ];

  // بيانات الحجوزات
  const bookingsChartData = [
    { 
      name: 'معلق', 
      value: stats?.bookings_status?.pending || 0,
      color: '#e67e22',
      percentage: stats?.bookings_count ? ((stats?.bookings_status?.pending || 0) / stats.bookings_count * 100).toFixed(1) : '0'
    },
    { 
      name: 'مؤكد', 
      value: stats?.bookings_status?.confirmed || 0,
      color: '#2980b9',
      percentage: stats?.bookings_count ? ((stats?.bookings_status?.confirmed || 0) / stats.bookings_count * 100).toFixed(1) : '0'
    },
    { 
      name: 'مكتمل', 
      value: stats?.bookings_status?.completed || 0,
      color: '#27ae60',
      percentage: stats?.bookings_count ? ((stats?.bookings_status?.completed || 0) / stats.bookings_count * 100).toFixed(1) : '0'
    },
    { 
      name: 'ملغي', 
      value: stats?.bookings_status?.cancelled || 0,
      color: '#c0392b',
      percentage: stats?.bookings_count ? ((stats?.bookings_status?.cancelled || 0) / stats.bookings_count * 100).toFixed(1) : '0'
    }
  ];

  // أداة تلميح مخصصة للرسوم البيانية
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            backgroundColor: 'background.paper',
            border: `1px solid ${theme.palette.grey[300]}`,
            borderRadius: 2
          }}
        >
          <Typography variant="body2" fontWeight="bold" color="textPrimary" gutterBottom>
            {label}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            العدد: <span style={{ color: payload[0].color, fontWeight: 'bold' }}>{payload[0].value}</span>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            النسبة: <span style={{ color: payload[0].color, fontWeight: 'bold' }}>{payload[0].payload.percentage}%</span>
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'var(--background-main)',
      py: { xs: 2, md: 3 },
      direction: 'rtl'
    }}>
      <Container maxWidth="xl" sx={{ p: { xs: 1, md: 2 } }}>
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DashboardIcon sx={{ fontSize: 40 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                إدارة النظام
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                مرحباً، rewan
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                لوحة تحكم النظام والإحصائيات العامة
              </Typography>
            </Box>
          </Box>
        </div>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <div className="kpi-card">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <div className={card.iconClass}>
                    {card.icon}
                  </div>
                  <TrendIndicator value={card.trend} isPositive={card.trendUp} />
                </Box>
                <Typography className="kpi-number">
                  {card.value}
                </Typography>
                <Typography className="kpi-label">
                  {card.title}
                </Typography>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* System Notifications */}
        <div className="notification-card">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--text-primary)' }}>
            تنبيهات النظام
          </Typography>
          <div className="notification-item">
            <div className="notification-icon notification-warning">
              <WarningIcon sx={{ fontSize: 20 }} />
            </div>
            <div className="notification-content">
              <div className="notification-title">
                يحتاج مقدم خدمة إلى مراجعة بسبب تقييمات العملاء المنخفضة
              </div>
              <div className="notification-time">منذ 5 دقائق</div>
            </div>
          </div>
          <div className="notification-item">
            <div className="notification-icon notification-info">
              <TrendingUpIcon sx={{ fontSize: 20 }} />
            </div>
            <div className="notification-content">
              <div className="notification-title">
                زيادة بنسبة 25% في الحجوزات اليوم
              </div>
              <div className="notification-time">منذ ساعة</div>
            </div>
          </div>
          <div className="notification-item">
            <div className="notification-icon notification-success">
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            </div>
            <div className="notification-content">
              <div className="notification-title">
                تمت الموافقة على مقدم خدمة جديد
              </div>
              <div className="notification-time">منذ ساعتين</div>
            </div>
          </div>
        </div>

        {/* Quick Statistics */}
        <div className="stats-card">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--text-primary)' }}>
            إحصائيات سريعة
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                معدل الحجوزات المكتملة
              </Typography>
              <div className="progress-bar">
                <div className="progress-fill progress-success" style={{ width: '92%' }}></div>
              </div>
              <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                92%
              </Typography>
            </Box>
            <Box sx={{ flex: 1, mx: 2 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                رضا العملاء
              </Typography>
              <div className="progress-bar">
                <div className="progress-fill progress-warning" style={{ width: '92%' }}></div>
              </div>
              <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                4.6/5
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
                استقرار النظام
              </Typography>
              <div className="progress-bar">
                <div className="progress-fill progress-info" style={{ width: '99.9%' }}></div>
              </div>
              <Typography variant="body2" sx={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                99.9%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <span className="status-chip status-pending">قيد المراجعة</span>
            <span className="status-chip status-active">نشط</span>
            <span className="status-chip status-active">نشط</span>
          </Box>
        </div>

        {/* New Users */}
        <div className="users-card">
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'var(--text-primary)' }}>
            المستخدمون الجدد
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="user-avatar">أ</div>
              <Box>
                <div className="user-name">أحمد السباك</div>
                <div className="user-role">مزود خدمة</div>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="user-avatar">س</div>
              <Box>
                <div className="user-name">سارة علي</div>
                <div className="user-role">عميل</div>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div className="user-avatar">م</div>
              <Box>
                <div className="user-name">محمد الكهربائي</div>
                <div className="user-role">مزود خدمة</div>
              </Box>
            </Box>
          </Box>
        </div>
      </Container>
    </Box>
  );
};

export default AdminDashboard;