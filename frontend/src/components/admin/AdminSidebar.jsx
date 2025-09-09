import React, { useState } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Build as ServicesIcon,
  ShoppingCart as OrdersIcon,
  RateReview as ReviewsIcon,
  ChevronRight,
  ChevronLeft,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const drawerWidth = 240;

const menuItems = [
  { text: "لوحة التحكم", icon: <DashboardIcon />, path: "/admin" },
  { text: "المستخدمون", icon: <PeopleIcon />, path: "/admin/users" },
  { text: "الخدمات", icon: <ServicesIcon />, path: "/admin/services" },
  { text: "الطلبات", icon: <OrdersIcon />, path: "/admin/orders" },
  { text: "المراجعات", icon: <ReviewsIcon />, path: "/admin/reviews" },
];

const AdminSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        width: collapsed ? 72 : drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: collapsed ? 72 : drawerWidth,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
          color: "#fff",
          borderLeft: "none",
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
          p: 1.5,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
          transition: "width 0.3s ease",
        },
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: collapsed ? 0.5 : 2 }}>
        {!collapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            لوحة التحكم
          </Typography>
        )}
        <IconButton
          onClick={() => setCollapsed((prev) => !prev)}
          sx={{ color: "#CBD5E1" }}
        >
          {collapsed ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
      <Box sx={{ mt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const selected = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    mb: 1,
                    py: 1.2,
                    px: collapsed ? 1 : 2,
                    justifyContent: collapsed ? "center" : "flex-start",
                    color: selected ? "#fff" : "#CBD5E1",
                    background: selected
                      ? "linear-gradient(90deg, #06B6D4 0%, #3B82F6 100%)"
                      : "transparent",
                    boxShadow: selected
                      ? "0 4px 12px rgba(59,130,246,0.35)"
                      : "none",
                    "&:hover": {
                      background: selected
                        ? "linear-gradient(90deg, #06B6D4 0%, #3B82F6 100%)"
                        : "rgba(255,255,255,0.08)",
                      transform: collapsed ? "none" : "translateX(-4px)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: selected ? "#fff" : "#94A3B8",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: selected ? "bold" : 500,
                        fontSize: "0.95rem",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;
