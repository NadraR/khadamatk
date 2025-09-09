// src/layout/AdminLayout.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Paper,
  useTheme,
  useMediaQuery,
  CssBaseline,
  InputBase,
  Badge,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import AdminSidebar from "../components/admin/AdminSidebar";
import adminApi from "../services/adminApiService";

const APP_BAR_HEIGHT_MOBILE = 56;
const APP_BAR_HEIGHT_DESKTOP = 64;
const DESKTOP_BREAKPOINT = 900;

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= DESKTOP_BREAKPOINT
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAdminAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleSidebarToggle = () => setSidebarOpen((v) => !v);
  const handleProfileMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
    navigate("/admin/login");
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "row", direction: "rtl" }}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: "100%",
          zIndex: (t) => t.zIndex.drawer + 2,
          color: "#fff",
          background: "#1F293B",
          backdropFilter: "blur(10px)",
          borderBottomLeftRadius: { md: 24 },
          borderBottomRightRadius: { md: 24 },
          boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: {
              xs: APP_BAR_HEIGHT_MOBILE,
              md: APP_BAR_HEIGHT_DESKTOP,
            },
            px: { xs: 1.5, md: 2.5 },
            gap: 1,
            justifyContent: "space-between",
          }}
        >
          {/* Sidebar toggle for mobile */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleSidebarToggle}
            edge="start"
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Title / Logo */}
          <Typography
            variant="h5"
            noWrap
            component="div"
            sx={{
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "-0.025em",
            }}
            onClick={() => navigate("/admin")}
            title="لوحة التحكم"
          >
            لوحة التحكم
          </Typography>

          {/* Search + Actions */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexGrow: 1,
              justifyContent: "flex-end",
            }}
          >
            {/* Search */}
            {!isMobile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.15)",
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  minWidth: 220,
                }}
              >
                <SearchIcon sx={{ fontSize: 20, opacity: 0.8, mr: 1, ml: 0.5 }} onClick={() => navigate("/admin/search")} />
                <InputBase
                  placeholder="ابحث..."
                  sx={{
                    color: "#fff",
                    fontSize: 14,
                    width: "100%",
                    "& .MuiInputBase-input": {
                      py: 0.5,
                    },
                  }}
                />
              </Box>
            )}

            {/* Notifications */}
            <IconButton sx={{ color: "#fff" }}>
              <Badge badgeContent={adminApi.notificationsCount} color="error">
                <NotificationsIcon onClick={() => navigate("/admin/notifications")} />
              </Badge>
            </IconButton>

            {/* User Info */}
            {!isMobile && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                مرحباً <span style={{ fontWeight: 800 }}>{user?.username}</span>
              </Typography>
            )}

            {/* Avatar */}
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              onClick={handleProfileMenuOpen}
              sx={{
                ml: 1,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2.5,
                "&:hover": { background: "rgba(255,255,255,0.2)" },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "#7C3AED",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {user?.username?.charAt(0)?.toUpperCase() || "K"}
              </Avatar>
            </IconButton>

            {/* Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { mt: 1.5, minWidth: 180, borderRadius: 2 },
              }}
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, color: "error.main", fontSize: 20 }} />
                تسجيل الخروج
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          right: 0,
          top: `${APP_BAR_HEIGHT_DESKTOP}px`,
          height: `calc(100vh - ${APP_BAR_HEIGHT_DESKTOP}px)`,
          zIndex: (t) => t.zIndex.drawer,
        }}
      >
        <AdminSidebar open={true} onClose={() => {}} />
      </Box>

      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          right: 0,
          top: `${APP_BAR_HEIGHT_MOBILE}px`,
          height: `calc(100vh - ${APP_BAR_HEIGHT_MOBILE}px)`,
          zIndex: (t) => t.zIndex.drawer,
        }}
      >
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          pt: {
            xs: `${APP_BAR_HEIGHT_MOBILE + 8}px`,
            md: `${APP_BAR_HEIGHT_DESKTOP + 12}px`,
          },
          pb: { xs: 2, md: 3 },
          px: { xs: 1.5, md: 3 },
          pr: { md: "260px" },
          direction: "rtl",
          minHeight: "100vh",
          background: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(1200px 600px at 100% -200px, rgba(124,58,237,0.05), transparent), radial-gradient(800px 400px at -200px 100%, rgba(6,182,212,0.05), transparent)",
            pointerEvents: "none",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
