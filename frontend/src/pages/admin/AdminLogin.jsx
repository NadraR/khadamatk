import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { motion } from "framer-motion";
import { Lock, Person } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  // Debug environment variables
  console.log('AdminLogin: Environment variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    NODE_ENV: import.meta.env.NODE_ENV
  });

  // Redirect to admin dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    console.log('AdminLogin: Starting login with:', { username: formData.username, password: '***' });
    console.log('AdminLogin: Form data:', formData);
    console.log('AdminLogin: Username field value:', formData.username);
    console.log('AdminLogin: Password field value:', formData.password);
    try {
      const response = await login(formData.username, formData.password);
      console.log('AdminLogin: Login successful, response:', response);
      // Navigation will be handled by useEffect when isAuthenticated becomes true
    } catch (err) {
      console.error('AdminLogin: Login error:', err);
      console.error('AdminLogin: Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setError(
        err.response?.data?.detail || "اسم المستخدم أو كلمة المرور غير صحيحة"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd 50%, #bbdefb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: `'Cairo', 'Tajawal', 'Segoe UI', sans-serif`,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 5,
              borderRadius: 5,
              textAlign: "center",
              background: "#fff",
            }}
          >
            {/* Logo / Title */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  width: 110,
                  height: 110,
                  bgcolor: "primary.main",
                  color: "#fff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 900,
                  mb: 2,
                  mx: "auto",
                  boxShadow: 4,
                  letterSpacing: 1,
                }}
              >
                خدماتك
              </Box>
            </motion.div>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: "primary.main",
                mb: 1,
                letterSpacing: 0.5,
              }}
            >
              تسجيل الدخول
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ mb: 3, fontWeight: 600, color: "text.secondary" }}
            >
              لوحة التحكم الإدارية
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontWeight: 600 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ mt: 2, textAlign: "right" }}
            >
              {/* Username */}
              <TextField
                required
                fullWidth
                id="username"
                name="username"
                label="اسم الأدمن"
                value={formData.username}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                  style: {
                    textAlign: "right",
                    fontWeight: 600,
                  },
                }}
              />

              {/* Password */}
              <TextField
                required
                fullWidth
                type="password"
                id="password"
                name="password"
                label="كلمة المرور"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  style: {
                    textAlign: "right",
                    fontWeight: 600,
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  mt: 3,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: 18,
                  py: 1.5,
                  background:
                    "linear-gradient(90deg, #1976d2 70%, #42a5f5 100%)",
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "تسجيل الدخول"
                )}
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AdminLogin;
