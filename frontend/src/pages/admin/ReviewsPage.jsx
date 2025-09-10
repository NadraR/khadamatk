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
  Badge,
} from '@mui/material';
import {
  MessageSquare as MessageSquareIcon,
  Menu as MenuIcon,
  Globe as GlobeIcon,
  Bell as BellIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon,
  ThumbsUp as ThumbsUpIcon,
  MessageCircle as MessageCircleIcon,
  Trash2 as TrashIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { reviewsApi, notificationsApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import '../../styles/adminCommon.css';
import './AdminDashboard.css';

const ReviewsPage = () => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user, isAuthenticated } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // تحديث حالة السايد بار عند تغيير حجم الشاشة
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    fetchReviews();
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

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reviewsApi.getReviews();
      console.log('API /reviews/ data:', response);
      if (response.success) {
        setReviews(response.data || []);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('خطأ في تحميل المراجعات');
      console.error('Reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = async (id) => {
    try {
      const response = await reviewsApi.softDeleteReview(id);
      if (response.success) {
      setReviews(reviews => reviews.filter(r => r.id !== id));
        showSnackbar('تم حذف المراجعة بنجاح');
      } else {
        showSnackbar('خطأ في حذف المراجعة', 'error');
      }
    } catch (err) {
      showSnackbar('خطأ في حذف المراجعة', 'error');
      console.error('Delete review error:', err);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // حساب الإحصائيات
  const totalReviews = reviews.length;
  const averageRating = reviews.length > 0 ? 
    (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1) : 0;
  const fiveStarReviews = reviews.filter(review => review.rating === 5).length;
  const fourStarReviews = reviews.filter(review => review.rating === 4).length;

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
                {t('reviews management')}
              </Typography>
              <Typography variant="body1" sx={{ color: isDarkMode ? '#9ca3af' : '#666666' }}>
                {t('reviews management description')}
              </Typography>
            </Box> */}
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('total reviews')}
                value={totalReviews.toString()}
                icon={<MessageSquareIcon />}
                iconColor="#7b1fa2"
                subtitle={t('reviews')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('average rating')}
                value={averageRating}
                icon={<TrendingUpIcon />}
                iconColor="#10b981"
                subtitle={t('out of 5')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('five star reviews')}
                value={fiveStarReviews.toString()}
                icon={<ThumbsUpIcon />}
                iconColor="#f59e0b"
                subtitle={t('excellent')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('four star reviews')}
                value={fourStarReviews.toString()}
                icon={<MessageCircleIcon />}
                iconColor="#3b82f6"
                subtitle={t('very good')}
              />
            </Grid>
          </Grid>

          {/* Reviews Cards */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: 2.5,
            mt: 2
          }}>
            {reviews && reviews.length > 0 ? reviews.map((review) => (
              <Card
                key={review.id}
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
                  {/* Review Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.9rem' }}>
                      {t('review')} #{review.id}
                    </Typography>
                    <Chip
                      label={`${review.rating || 0} ⭐`}
                      size="small"
                      sx={{ 
                        borderRadius: '6px', 
                        fontSize: '0.7rem',
                        backgroundColor: '#7b1fa2',
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>

                  {/* Review Details */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('user')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {review.user_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('service')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {review.service_name || t('custom service')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('worker')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {review.worker_name || t('not specified')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#64748b', fontSize: '0.8rem' }}>
                        {t('date')}:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDarkMode ? '#e5e7eb' : '#1e293b', fontSize: '0.8rem' }}>
                        {review.created_at ? new Date(review.created_at).toLocaleDateString('ar-SA') : t('not specified')}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Review Text */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Typography variant="body2" sx={{ 
                      color: isDarkMode ? '#9ca3af' : '#64748b', 
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                      lineHeight: 1.4
                    }}>
                      "{review.text || t('no review text')}"
                    </Typography>
                  </Box>

                  {/* Action Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto' }}>
                    <Tooltip title={t('delete review')}>
                      <IconButton 
                        size="small"
                        onClick={() => handleSoftDelete(review.id)} 
                        sx={{ 
                          color: '#ef4444',
                          '&:hover': { background: 'rgba(239,68,68,0.1)' }
                        }}
                      >
                        <TrashIcon size={16} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            )) : (
              <Box sx={{ textAlign: 'center', py: 4, gridColumn: '1 / -1' }}>
                <MessageSquareIcon size={60} color={isDarkMode ? '#9ca3af' : '#d1d5db'} style={{ marginBottom: '16px' }} />
                <Typography variant="h6" sx={{ color: isDarkMode ? '#e5e7eb' : '#666666', mb: 1 }}>
                  {t('no results')}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#9ca3af' : '#999999' }}>
                  {t('no reviews found')}
                </Typography>
              </Box>
            )}
          </Box>

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

export default ReviewsPage;
