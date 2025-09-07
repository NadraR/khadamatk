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
  Error as ErrorIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { adminApiService } from '../../services/adminApiService';

// مكون مساعد لعرض نسبة التغيير
const TrendIndicator = ({ value, isPositive }) => (
  <Chip
    label={value}
    size="small"
    sx={{
      mt: 1,
      backgroundColor: isPositive ? 'success.light' : 'error.light',
      color: isPositive ? 'success.dark' : 'error.dark',
      fontSize: '0.75rem',
      height: 20
    }}
  />
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
      title: 'المستخدمين',
      value: stats?.users_count || 0,
      icon: <PeopleIcon />,
      color: '#2c3e50',
      bg: 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'الخدمات',
      value: stats?.services_count || 0,
      icon: <BusinessIcon />,
      color: '#27ae60',
      bg: 'linear-gradient(135deg, #d5f4e6 0%, #a9dfbf 100%)',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'الطلبات',
      value: stats?.orders_count || 0,
      icon: <AssignmentIcon />,
      color: '#8e44ad',
      bg: 'linear-gradient(135deg, #e8daef 0%, #d2b4de 100%)',
      trend: '+15%',
      trendUp: true
    },
    {
      title: 'الحجوزات',
      value: stats?.bookings_count || 0,
      icon: <AssignmentIcon />,
      color: '#e67e22',
      bg: 'linear-gradient(135deg, #fdebd0 0%, #f8c471 100%)',
      trend: '+10%',
      trendUp: true
    },
    {
      title: 'الفواتير',
      value: stats?.invoices_count || 0,
      icon: <ReceiptIcon />,
      color: '#c0392b',
      bg: 'linear-gradient(135deg, #fadbd8 0%, #f1948a 100%)',
      trend: '+20%',
      trendUp: true
    },
    {
      title: 'متوسط التقييم',
      value: stats?.avg_rating?.toFixed(1) || '0.0',
      icon: <TrendingUpIcon />,
      color: '#2980b9',
      bg: 'linear-gradient(135deg, #d6eaf8 0%, #85c1e9 100%)',
      trend: '+0.3',
      trendUp: true,
      suffix: '⭐'
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
      background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.primary.light}05 100%)`,
      py: { xs: 2, md: 3 },
      direction: 'rtl'
    }}>
      <Container maxWidth="xl" sx={{ p: { xs: 1, md: 2 } }}>
        {/* Header Section */}
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              borderRadius: 3,
              p: { xs: 2, md: 4 },
              mb: 3,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                pointerEvents: 'none'
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DashboardIcon sx={{ fontSize: 32 }} />
                    لوحة التحكم الإدارية
                  </Typography>
                  <Typography variant="subtitle1" sx={{ opacity: 0.9, fontSize: '1.1rem' }}>
                    مرحباً بك في لوحة التحكم الإدارية، يمكنك متابعة الإحصائيات بشكل سريع واحترافي
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {refreshing && <CircularProgress size={24} sx={{ color: 'white' }} />}
                  <Tooltip title="تحديث البيانات">
                    <IconButton
                      onClick={handleRefresh}
                      disabled={refreshing}
                      sx={{
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 2 }} />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                آخر تحديث: {new Date().toLocaleString('ar-SA')}
              </Typography>
            </Box>
          </Paper>
        </Fade>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Fade in timeout={800}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                <Card
                  elevation={2}
                  sx={{
                    height: { xs: 120, md: 140 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: 2,
                    background: card.bg,
                    border: `1px solid ${card.color}20`,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                      '& .card-icon': {
                        transform: 'scale(1.1) rotate(5deg)'
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '100%',
                      height: '4px',
                      background: card.color,
                      opacity: 0.8
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            fontWeight: 600, 
                            fontSize: '0.875rem',
                            textAlign: 'right',
                            mb: 0.5
                          }}
                        >
                          {card.title}
                        </Typography>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 'bold', 
                            color: card.color, 
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            textAlign: 'right',
                            lineHeight: 1.2
                          }}
                        >
                          {card.value}{card.suffix || ''}
                        </Typography>
                        {card.trend && (
                          <TrendIndicator value={card.trend} isPositive={card.trendUp} />
                        )}
                      </Box>
                      <Box
                        className="card-icon"
                        sx={{
                          color: 'white',
                          background: card.color,
                          borderRadius: '50%',
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                          boxShadow: theme.shadows[2]
                        }}
                      >
                        {React.cloneElement(card.icon, { sx: { fontSize: 24 } })}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* Charts and Summary Section */}
        <Fade in timeout={1000}>
          <Grid container spacing={3}>
            {/* Orders Chart */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  height: { xs: 'auto', md: 400 },
                  background: 'white',
                  border: `1px solid ${theme.palette.grey[200]}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#8e44ad' }}>
                    إحصائيات الطلبات
                  </Typography>
                  <Chip
                    label={`إجمالي: ${stats?.orders_count || 0}`}
                    sx={{ backgroundColor: '#8e44ad', color: 'white' }}
                    size="small"
                  />
                </Box>
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <BarChart data={ordersChartData} barCategoryGap={20} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fontWeight: 600, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.grey[300] }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fontWeight: 600, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.grey[300] }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {ordersChartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Bookings Chart */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  height: { xs: 'auto', md: 400 },
                  background: 'white',
                  border: `1px solid ${theme.palette.grey[200]}`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 2 : 0 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#e67e22' }}>
                    إحصائيات الحجوزات
                  </Typography>
                  <Chip
                    label={`إجمالي: ${stats?.bookings_count || 0}`}
                    sx={{ backgroundColor: '#e67e22', color: 'white' }}
                    size="small"
                  />
                </Box>
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <BarChart data={bookingsChartData} barCategoryGap={20} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fontWeight: 600, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.grey[300] }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fontWeight: 600, fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: theme.palette.grey[300] }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {bookingsChartData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Quick Summary */}
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 2, md: 3 },
                  borderRadius: 2,
                  background: 'white',
                  border: `1px solid ${theme.palette.grey[200]}`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#27ae60', mb: 3 }}>
                  ملخص سريع
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'إجمالي المستخدمين', value: stats?.users_count || 0, icon: <PeopleIcon />, color: '#2c3e50' },
                    { label: 'الخدمات النشطة', value: stats?.services_count || 0, icon: <BusinessIcon />, color: '#27ae60' },
                    { label: 'الطلبات المعلقة', value: stats?.orders_status?.pending || 0, icon: <AssignmentIcon />, color: '#e67e22' },
                    { label: 'الحجوزات المؤكدة', value: stats?.bookings_status?.confirmed || 0, icon: <AssignmentIcon />, color: '#2980b9' },
                    { label: 'متوسط التقييم', value: `${stats?.avg_rating?.toFixed(1) || '0.0'} ⭐`, icon: <StarIcon />, color: '#8e44ad' },
                    { label: 'إجمالي الفواتير', value: stats?.invoices_count || 0, icon: <ReceiptIcon />, color: '#c0392b' }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: `${item.color}08`,
                          border: `1px solid ${item.color}20`,
                          transition: 'all 0.2s ease',
                          height: '100%',
                          '&:hover': {
                            backgroundColor: `${item.color}12`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 4px 12px ${item.color}30`
                          }
                        }}
                      >
                        <Box
                          sx={{
                            color: 'white',
                            backgroundColor: item.color,
                            borderRadius: '50%',
                            p: 1.5,
                            mr: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 40,
                            height: 40
                          }}
                        >
                          {React.cloneElement(item.icon, { sx: { fontSize: 20 } })}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: item.color, fontSize: '1.25rem' }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
};

export default AdminDashboard;