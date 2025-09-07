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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 900);
  const [anchorEl, setAnchorEl] = useState(null);
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
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', direction: 'rtl' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={6}
        sx={{
          width: '100%',
          ml: 0,
          // أزلنا left
          zIndex: (theme) => theme.zIndex.drawer + 1,
          direction: 'rtl',
          background: 'linear-gradient(90deg, #1976d2 70%, #42a5f5 100%)',
          borderBottomLeftRadius: { md: 24 },
          borderBottomRightRadius: 0,
          boxShadow: '0 4px 24px 0 #1976d233',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 1, md: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            onClick={handleSidebarToggle}
            edge="start"
            sx={{ mr: 2, background: '#fff2', borderRadius: 2, '&:hover': { background: '#fff4' } }}
          >
            {/* <MenuIcon sx={{ fontSize: 24 }} /> */}
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', userSelect: 'none' }}
            onClick={() => navigate('/admin')}
            title="العودة للوحة التحكم"
          >
            لوحة التحكم الإدارية - <span style={{ color: '#fff', fontWeight: 900 }}>خدماتك</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 500, fontSize: 17 }}>
              مرحباً، <span style={{ fontWeight: 700 }}>{user?.username}</span>
            </Typography>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1, background: '#fff2', borderRadius: 2, '&:hover': { background: '#fff4' } }}
            >
              <Avatar sx={{ width: 38, height: 38, bgcolor: '#fff', color: '#1976d2', fontWeight: 700, fontSize: 22, border: '2px solid #1976d2' }}>
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
                <LogoutIcon sx={{ mr: 1 , fontWeight: 700, color: 'error.main', textAlign: 'right', fontSize: 17 }}/>
                تسجيل الخروج
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          position: 'fixed',
          right: 0,
          top: '64px',
          height: 'calc(100vh - 64px)',
          zIndex: (theme) => theme.zIndex.drawer,
        }}
      >
        <AdminSidebar open={true} onClose={() => {}} />
      </Box>
      {/* Drawer للهواتف */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, md: 3 },
          width: '100%',
          pr: { md: '260px' }, // زيادة المسافة اليمنى للمحتوى الرئيسي
          direction: 'rtl',
          minHeight: '100vh',
          background: 'linear-gradient(120deg, #f8fafc 60%, #e3f2fd 100%)',
          transition: 'padding 0.3s',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
