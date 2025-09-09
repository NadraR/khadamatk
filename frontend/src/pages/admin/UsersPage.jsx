// src/pages/admin/UsersPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { adminApiService } from "../../services/adminApiService";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApiService.getUsers();
      setUsers(data);
    } catch {
      setError("فشل في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminApiService.activateUser(userId);
      fetchUsers();
    } catch {
      setError("فشل في تفعيل المستخدم");
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await adminApiService.deactivateUser(userId);
      fetchUsers();
    } catch {
      setError("فشل في تعطيل المستخدم");
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          جاري تحميل المستخدمين...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* عنوان الصفحة */}
      <Typography
        variant="h4"
        textAlign="center"
        sx={{
          fontWeight: 700,
          color: "#1976d2",
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: "2px solid #1976d2",
          bgcolor: "#e3f2fd",
        }}
      >
        إدارة المستخدمين
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* عرض المستخدمين بالكروت */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
          gap: 3,
        }}
      >
        {users.map((user) => (
          <Paper
            key={user.id}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              background: "#fff",
              border: "1px solid #e0e0e0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              transition: "0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              },
            }}
          >
            {/* Header: Avatar + اسم المستخدم */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ bgcolor: "#1976d2", width: 48, height: 48 }}>
                {user.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {user.username}
              </Typography>
            </Box>

            {/* البريد الإلكتروني */}
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
              {user.email}
            </Typography>

            {/* الدور والحالة */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={user.role === "worker" ? "مقدم خدمة" : "عميل"}
                color={user.role === "worker" ? "primary" : "secondary"}
                size="small"
              />
              <Chip
                label={user.is_active ? "نشط" : "معطل"}
                color={user.is_active ? "success" : "error"}
                size="small"
              />
              <Chip
                label={user.is_staff ? "ادمن" : "مستخدم"}
                color={user.is_staff ? "warning" : "default"}
                size="small"
              />
            </Box>

            {/* الأزرار */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: "auto" }}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleActivateUser(user.id)}
                disabled={user.is_active}
                sx={{ textTransform: "none" }}
              >
                تفعيل
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => handleDeactivateUser(user.id)}
                disabled={!user.is_active}
                sx={{ textTransform: "none" }}
              >
                تعطيل
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default UsersPage;
