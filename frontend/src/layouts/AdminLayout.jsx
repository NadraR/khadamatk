import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Language as LanguageIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import { notificationsApi } from '../services/adminApiService';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 900);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user, logout } = useAdminAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // جلب عدد الإشعارات غير المقروءة
  React.useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadNotifications(count);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', direction: 'rtl', height: '100vh', overflow: 'hidden' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: '100%',
          ml: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          direction: 'rtl',
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fbff 100%)',
          borderBottom: '1px solid rgba(0,123,255,0.1)',
          boxShadow: '0 4px 15px rgba(0,123,255,0.1)',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
          {/* Left side - Menu Toggle, Notification and Language */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              aria-label="toggle sidebar"
              onClick={handleSidebarToggle}
              sx={{ 
                color: '#0077ff',
                '&:hover': {
                  background: 'rgba(0,123,255,0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <MenuIcon />
            </IconButton>
            <Badge badgeContent={unreadNotifications} color="error">
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                background: 'linear-gradient(135deg, #0077ff 0%, #4da6ff 100%)', 
                color: 'white', 
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
              }}>
                {user?.username?.charAt(0).toUpperCase() || 'A'}
              </Avatar>
            </Badge>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value="en"
                displayEmpty
                sx={{ 
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiSelect-select': { padding: '8px 12px' }
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ar">العربية</MenuItem>
              </Select>
            </FormControl>
            <IconButton sx={{ color: '#666' }}>
              <LightModeIcon />
            </IconButton>
          </Box>

          {/* Center - Search */}
          <TextField
            placeholder="البحث في النظام..."
            size="small"
            sx={{
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'rgba(0,123,255,0.05)',
                border: '1px solid rgba(0,123,255,0.1)',
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' },
                '&:hover': {
                  backgroundColor: 'rgba(0,123,255,0.08)',
                  border: '1px solid rgba(0,123,255,0.2)',
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(0,123,255,0.1)',
                  border: '1px solid rgba(0,123,255,0.3)',
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#0077ff' }} />
                </InputAdornment>
              ),
            }}
          />

          {/* Right side - User info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#0077ff', fontWeight: 600 }}>
              {user?.username} مشرف النظام
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Avatar sx={{ 
                width: 40, 
                height: 40, 
                background: 'linear-gradient(135deg, #0077ff 0%, #4da6ff 100%)', 
                color: 'white', 
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(0,123,255,0.3)'
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, color: 'error.main' }}/>
                تسجيل الخروج
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, md: 3 },
          width: '100%',
          direction: 'rtl',
          height: '100vh',
          overflow: 'auto',
          background: 'linear-gradient(180deg, #f9fbff 0%, #ffffff 100%)',
          ml: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
