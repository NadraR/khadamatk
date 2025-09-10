import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Globe as GlobeIcon,
  Menu as MenuIcon,
  Bell as BellIcon,
} from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useCustomTheme } from '../../contexts/ThemeContext';
import { notificationsApi } from '../../services/adminApiService';

const AdminHeader = ({ onMenuClick, sidebarOpen }) => {
  const { t, toggleLanguage, currentLang } = useTranslation();
  const { user } = useAdminAuth();
  const { isDarkMode } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // جلب عدد الإشعارات غير المقروءة
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        console.log('Fetching unread notifications count...');
        const count = await notificationsApi.getUnreadCount();
        console.log('Unread count:', count);
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
    console.log('Notifications icon clicked!');
    navigate('/admin/notifications');
  };

  console.log('AdminHeader rendering, unreadCount:', unreadCount);
  console.log('AdminHeader user:', user);
  console.log('AdminHeader isDarkMode:', isDarkMode);

  return (
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
                mb: 0.2
              }}
            >
              {user?.username || t('system administrator')}
            </Typography>
          </Box>
        </Box>
        
        {/* الجانب الأيمن - أزرار التحكم */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* زر الإشعارات */}
          {console.log('Rendering notifications icon with unreadCount:', unreadCount)}
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
              }
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
                letterSpacing: 0.5
              }}
            >
              {currentLang === 'ar' ? 'English' : 'عربي'}
            </Typography>
          </Box>
          
          {/* زر السايد بار */}
          <IconButton
            onClick={onMenuClick}
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
  );
};

export default AdminHeader;
