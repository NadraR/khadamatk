import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  AppBar,
  Toolbar,
  Avatar,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material';
import {
  Bell as NotificationsIcon,
  MoreVertical as MoreVertIcon,
  CheckCircle as MarkEmailReadIcon,
  Trash2 as DeleteIcon,
  Filter as FilterListIcon,
  Globe as GlobeIcon,
  Menu as MenuIcon,
  Bell as BellIcon,
  Bell as BellIconLucide,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { notificationsApi } from '../../services/adminApiService';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCustomTheme } from '../../contexts/ThemeContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import './AdminDashboard.css';

const AdminNotifications = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  // جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    const fetchUnreadNotificationsCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadNotificationsCount(count);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    if (user) {
      fetchUnreadNotificationsCount();
      // تحديث العدد كل 30 ثانية
      const interval = setInterval(fetchUnreadNotificationsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsApi.getNotifications();
      
      // تطبيق الفلتر
      let filteredData = data;
      if (filter === 'unread') {
        filteredData = data.filter(notification => !notification.is_read);
      } else if (filter === 'read') {
        filteredData = data.filter(notification => notification.is_read);
      }
      
      setNotifications(filteredData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('خطأ في جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleNotificationsClick = () => {
    navigate('/admin/notifications');
  };

  // حساب الإحصائيات
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(n => !n.is_read).length;
  const readNotifications = notifications.filter(n => n.is_read).length;
  const todayNotifications = notifications.filter(n => {
    const today = new Date();
    const notificationDate = new Date(n.created_at);
    return notificationDate.toDateString() === today.toDateString();
  }).length;

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📋';
      case 'payment':
        return '💳';
      case 'review':
        return '⭐';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#f59e0b';
      case 'payment':
        return '#10b981';
      case 'review':
        return '#f97316';
      case 'system':
        return '#6b7280';
      default:
        return '#0077ff';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${diffInHours} ساعة`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `منذ ${diffInDays} يوم`;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
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
                badgeContent={unreadNotificationsCount} 
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
            ? 'linear-gradient(180deg, #0a0f1a 0%, #111827 100%)'
            : 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
          direction: 'rtl',
          overflowX: 'hidden',
          overflowY: 'auto',
          maxWidth: '1700px',
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
                {t('notifications')}
              </Typography>
              <Typography variant="body1" sx={{ color: isDarkMode ? '#9ca3af' : '#666666' }}>
                {t('notifications management description')}
        </Typography>
            </Box> */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 120,
                  '& .MuiOutlinedInput-root': {
                    color: isDarkMode ? '#e5e7eb' : '#1e293b',
                    '& fieldset': {
                      borderColor: isDarkMode ? '#374151' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: isDarkMode ? '#4b5563' : '#9ca3af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#0077ff',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: isDarkMode ? '#9ca3af' : '#6b7280',
                  },
                }}
              >
                <InputLabel>{t('filter')}</InputLabel>
            <Select
              value={filter}
                  label={t('filter')}
              onChange={(e) => setFilter(e.target.value)}
            >
                  <MenuItem value="all">{t('all_notifications')}</MenuItem>
                  <MenuItem value="unread">{t('unread')}</MenuItem>
                  <MenuItem value="read">{t('read')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter(n => !n.is_read).length === 0}
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
                {t('mark_all_as_read')}
          </Button>
        </Box>
      </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('total_notifications')}
                value={totalNotifications.toString()}
                icon={<BellIconLucide />}
                iconColor="#0077ff"
                subtitle={t('notifications')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('unread_notifications')}
                value={unreadNotifications.toString()}
                icon={<EyeOffIcon />}
                iconColor="#ef4444"
                subtitle={t('new')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('read_notifications')}
                value={readNotifications.toString()}
                icon={<EyeIcon />}
                iconColor="#10b981"
                subtitle={t('read')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={t('today_notifications')}
                value={todayNotifications.toString()}
                icon={<CalendarIcon />}
                iconColor="#f59e0b"
                subtitle={t('today')}
              />
            </Grid>
          </Grid>

          {/* Notifications Cards */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, 
            gap: 2.5,
            mt: 2
          }}>
            {notifications && notifications.length > 0 ? notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card
                sx={{
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: isDarkMode 
                      ? '0 2px 8px rgba(0,0,0,0.3)' 
                      : '0 2px 8px rgba(0,123,255,0.08)',
                    border: notification.is_read 
                      ? (isDarkMode ? '1px solid #374151' : '1px solid rgba(0,123,255,0.1)')
                      : (isDarkMode ? '1px solid rgba(0, 123, 255, 0.3)' : '1px solid rgba(0, 123, 255, 0.2)'),
                    background: notification.is_read 
                      ? (isDarkMode ? 'linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(10,15,26,0.9) 100%)' : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)')
                      : (isDarkMode ? 'linear-gradient(135deg, rgba(0,123,255,0.1) 0%, rgba(0,123,255,0.05) 100%)' : 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,123,255,0.02) 100%)'),
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: isDarkMode 
                        ? '0 8px 25px rgba(0,0,0,0.4)' 
                        : '0 8px 25px rgba(0,123,255,0.15)',
                    },
                    transition: 'all 0.3s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Notification Status Indicator */}
                  {!notification.is_read && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#ef4444',
                        boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Header with Icon and Menu */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: `${getNotificationColor(notification.type)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                          border: `2px solid ${getNotificationColor(notification.type)}40`,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Box>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, notification)}
                        size="small"
                        sx={{
                          color: isDarkMode ? '#9ca3af' : '#6b7280',
                          '&:hover': {
                            color: isDarkMode ? '#ffffff' : '#0077ff',
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,123,255,0.1)',
                          },
                        }}
                      >
                        <MoreVertIcon size={16} />
                      </IconButton>
                    </Box>

                    {/* Title */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: notification.is_read ? 500 : 600,
                        color: isDarkMode ? '#e5e7eb' : '#1e293b',
                        fontSize: '1rem',
                        mb: 1,
                        lineHeight: 1.3,
                      }}
                    >
                        {notification.title}
                    </Typography>

                    {/* Message */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: isDarkMode ? '#9ca3af' : '#6b7280',
                        fontSize: '0.85rem',
                        mb: 2,
                        flexGrow: 1,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notification.message}
                    </Typography>

                    {/* Footer with Date and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: isDarkMode ? '#6b7280' : '#9ca3af',
                          fontSize: '0.75rem',
                        }}
                      >
                        {formatDate(notification.created_at)}
                      </Typography>
                      {!notification.is_read && (
                        <Chip
                          label={t('new')}
                          size="small"
                          sx={{
                            bgcolor: '#ef4444',
                            color: 'white',
                            fontSize: '0.65rem',
                            height: 18,
                            fontWeight: 'bold',
                            '& .MuiChip-label': {
                              px: 1,
                            }
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <Box sx={{ 
                gridColumn: '1 / -1', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                minHeight: '300px'
              }}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: 4,
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
                  <NotificationsIcon sx={{ fontSize: 64, color: isDarkMode ? '#6b7280' : '#cbd5e1', mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: isDarkMode ? '#9ca3af' : '#6b7280',
                      fontWeight: 500
                    }}
                  >
                    {t('no_notifications')}
                      </Typography>
                </Card>
                    </Box>
            )}
          </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
            sx={{
              '& .MuiPaper-root': {
                bgcolor: isDarkMode ? '#1f2937' : '#ffffff',
                border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                boxShadow: isDarkMode 
                  ? '0 4px 20px rgba(0,0,0,0.4)' 
                  : '0 4px 20px rgba(0,123,255,0.3)',
                borderRadius: '8px',
              }
            }}
      >
        {selectedNotification && !selectedNotification.is_read && (
          <MenuItem
            onClick={() => {
              handleMarkAsRead(selectedNotification.id);
              handleMenuClose();
            }}
                sx={{
                  color: isDarkMode ? '#e5e7eb' : '#1e293b',
                  '&:hover': {
                    bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,123,255,0.1)',
                  }
                }}
          >
            <MarkEmailReadIcon sx={{ mr: 1 }} />
                {t('mark_as_read')}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleDeleteNotification(selectedNotification?.id);
            handleMenuClose();
          }}
              sx={{ 
                color: '#ef4444',
                '&:hover': {
                  bgcolor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                }
              }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
              {t('delete')}
        </MenuItem>
      </Menu>
    </Box>
      </Box>
    </>
  );
};

export default AdminNotifications;