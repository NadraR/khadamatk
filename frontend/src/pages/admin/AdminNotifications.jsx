import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { notificationsApi } from '../../services/adminApiService';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import '../../styles/adminCommon.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const { user } = useAdminAuth();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

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
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1e40af' }}>
          الإشعارات
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>فلتر</InputLabel>
            <Select
              value={filter}
              label="فلتر"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">جميع الإشعارات</MenuItem>
              <MenuItem value="unread">غير مقروءة</MenuItem>
              <MenuItem value="read">مقروءة</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<MarkEmailReadIcon />}
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter(n => !n.is_read).length === 0}
          >
            تحديد الكل كمقروء
          </Button>
        </Box>
      </Box>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <NotificationsIcon sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            لا توجد إشعارات
          </Typography>
        </Card>
      ) : (
        <List sx={{ bgcolor: 'background.paper' }}>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  bgcolor: notification.is_read ? 'transparent' : 'rgba(0, 123, 255, 0.05)',
                  borderRadius: 2,
                  mb: 1,
                  border: notification.is_read ? 'none' : '1px solid rgba(0, 123, 255, 0.1)',
                }}
              >
                <ListItemIcon sx={{ minWidth: 48 }}>
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
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: notification.is_read ? 400 : 600 }}>
                        {notification.title}
                      </Typography>
                      {!notification.is_read && (
                        <Chip
                          label="جديد"
                          size="small"
                          sx={{
                            bgcolor: '#ef4444',
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(notification.created_at)}
                      </Typography>
                    </Box>
                  }
                />
                <IconButton
                  onClick={(e) => handleMenuOpen(e, notification)}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
              </ListItem>
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedNotification && !selectedNotification.is_read && (
          <MenuItem
            onClick={() => {
              handleMarkAsRead(selectedNotification.id);
              handleMenuClose();
            }}
          >
            <MarkEmailReadIcon sx={{ mr: 1 }} />
            تحديد كمقروء
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleDeleteNotification(selectedNotification?.id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          حذف
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AdminNotifications;