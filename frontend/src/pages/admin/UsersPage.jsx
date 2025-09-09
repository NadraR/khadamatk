import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Menu as MenuIcon,
  Security as ShieldIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  Language as LanguageIcon,
  LightMode as LightModeIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { usersApi } from '../../services/adminApiService';
import '../../styles/adminCommon.css';


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageAnchor, setLanguageAnchor] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageClick = (event) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleLanguageClose = () => {
    setLanguageAnchor(null);
  };

  // جلب المستخدمين من الباك إند
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.error || 'فشل في تحميل المستخدمين');
      }
    } catch (err) {
      setError('فشل في تحميل المستخدمين');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      const response = await usersApi.toggleUserVerification(userId);
      if (response.success) {
        setSnackbar({ open: true, message: 'تم تحديث حالة التحقق بنجاح', severity: 'success' });
        fetchUsers(); // إعادة تحميل البيانات
      } else {
        setSnackbar({ open: true, message: response.error || 'فشل في تحديث حالة التحقق', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'فشل في تحديث حالة التحقق', severity: 'error' });
      console.error('Error toggling verification:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await usersApi.deleteUser(userId);
      if (response.success) {
        setSnackbar({ open: true, message: 'تم حذف المستخدم بنجاح', severity: 'success' });
        fetchUsers(); // إعادة تحميل البيانات
      } else {
        setSnackbar({ open: true, message: response.error || 'فشل في حذف المستخدم', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'فشل في حذف المستخدم', severity: 'error' });
      console.error('Error deleting user:', err);
    }
  };

  const getUserTypeChip = (type) => {
    const typeConfig = {
      client: { 
        color: '#E3F2FD', 
        textColor: '#1976D2', 
        label: 'عميل' 
      },
      provider: { 
        color: '#E8F5E8', 
        textColor: '#2E7D32', 
        label: 'مزود خدمة' 
      },
      admin: { 
        color: '#F3E5F5', 
        textColor: '#7B1FA2', 
        label: 'مشرف' 
      }
    };

    const config = typeConfig[type] || typeConfig.client;
    return (
      <Chip
        label={config.label}
        sx={{
          backgroundColor: config.color,
          color: config.textColor,
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px',
          '& .MuiChip-label': {
            px: 1.5
          }
        }}
      />
    );
  };

  const getStatusChip = (verified, userId) => {
    if (verified) {
      return (
        <Chip
          icon={<ViewIcon sx={{ fontSize: '14px !important' }} />}
          label="موثق"
          onClick={() => handleToggleVerification(userId)}
          sx={{
            backgroundColor: '#1A1A1A',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#333333'
            },
            '& .MuiChip-icon': {
              color: 'white'
            },
            '& .MuiChip-label': {
              px: 1.5
            }
          }}
        />
      );
    } else {
      return (
        <Chip
          label="غير موثق"
          onClick={() => handleToggleVerification(userId)}
          sx={{
            backgroundColor: '#F5F5F5',
            color: '#666666',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#E0E0E0'
            },
            '& .MuiChip-label': {
              px: 1.5
            }
          }}
        />
      );
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || user.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        direction: 'rtl'
      }}>
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2, color: '#666666' }}>
          جاري تحميل المستخدمين...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3, direction: 'rtl' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchUsers}
          sx={{ 
            backgroundColor: '#0077ff',
            '&:hover': { backgroundColor: '#0056b3' }
          }}
        >
          إعادة المحاولة
        </Button>
      </Box>
    );
  }

  return (
    <Box className="admin-page-container">
      {/* Top Navigation Bar */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: 'white',
          borderBottom: '1px solid #E0E0E0'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          {/* Left Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton sx={{ color: '#666' }}>
              <MenuIcon />
            </IconButton>
            <ShieldIcon sx={{ color: '#1976D2', fontSize: 28 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333',
                fontWeight: 600,
                fontSize: '1.25rem'
              }}
            >
              خدماتك
            </Typography>
          </Box>

          {/* Center */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1976D2',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              لوحة التحكم
            </Typography>
        <TextField
              placeholder="بحث فر"
          size="small"
              sx={{
                width: 200,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#F8F9FA',
                  '& fieldset': {
                    borderColor: '#E0E0E0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976D2'
                  }
                }
              }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666', fontSize: 20 }} />
              </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Right Side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ color: '#666' }}>
              <LightModeIcon />
            </IconButton>
            
            <Button
              onClick={handleLanguageClick}
              endIcon={<ArrowDownIcon />}
              sx={{ 
                color: '#333',
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              العربية
            </Button>

            <IconButton sx={{ color: '#666' }}>
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <IconButton sx={{ color: '#666' }}>
              <HelpIcon />
            </IconButton>

            <IconButton onClick={handleMenuClick}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  backgroundColor: '#1976D2',
                  fontSize: '0.9rem'
                }}
              >
                م
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 3 }}>
        {/* Page Title */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700,
            color: '#333',
            mb: 3,
            fontSize: '2rem'
          }}
        >
          إدارة المستخدمين
        </Typography>

        {/* Action Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          {/* Search and Filter */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
              placeholder="بحث"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#F8F9FA',
                  '& fieldset': {
                    borderColor: '#E0E0E0'
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976D2'
                  }
                }
              }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#666' }} />
              </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              sx={{
                borderRadius: '8px',
                borderColor: '#E0E0E0',
                color: '#333',
                textTransform: 'none',
                fontWeight: 500,
                px: 2
              }}
            >
              تصفية
            </Button>
          </Box>

          {/* Add User Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#1A1A1A',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#333'
              }
            }}
          >
            إضافة مستخدم
          </Button>
        </Box>

        {/* Users Table */}
        <Card sx={{ 
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #E0E0E0',
                    py: 2
                  }}>
                    المستخدم
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #E0E0E0',
                    py: 2
                  }}>
                    النوع
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #E0E0E0',
                    py: 2
                  }}>
                    الحالة
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #E0E0E0',
                    py: 2
                  }}>
                    الحجوزات
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #E0E0E0',
                    py: 2
                  }}>
                    تاريخ التسجيل
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    borderBottom: '1px solid #E0E0E0',
                    py: 2
                  }}>
                    الإجراءات
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow 
                    key={user.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#F8F9FA' },
                      borderBottom: index < filteredUsers.length - 1 ? '1px solid #F0F0F0' : 'none'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={user.avatar} 
                          alt={user.name}
                          sx={{ 
                            width: 40, 
                            height: 40,
                            border: '2px solid #E0E0E0'
                          }}
                        >
                          {user.name.charAt(0)}
                </Avatar>
                <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#333',
                              fontSize: '0.9rem'
                            }}
                          >
                            {user.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#666',
                              fontSize: '0.8rem'
                            }}
                          >
                            {user.email}
                          </Typography>
                </Box>
              </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {getUserTypeChip(user.type)}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      {getStatusChip(user.verified, user.id)}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: '#333'
                        }}
                      >
                        {user.totalBookings}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#666',
                          fontSize: '0.9rem'
                        }}
                      >
                        {user.createdAt}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            // عرض تفاصيل المستخدم
                            setSnackbar({ open: true, message: `عرض تفاصيل ${user.name}`, severity: 'info' });
                          }}
                          sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: '#F0F0F0' }
                          }}
                        >
                          <ViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            // تعديل المستخدم
                            setSnackbar({ open: true, message: `تعديل ${user.name}`, severity: 'info' });
                          }}
                          sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: '#F0F0F0' }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            // حذف المستخدم
                            if (window.confirm(`هل أنت متأكد من حذف ${user.name}؟`)) {
                              handleDeleteUser(user.id);
                            }
                          }}
                          sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: '#F0F0F0' }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
              </Box>
                    </TableCell>
                  </TableRow>
          ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>الملف الشخصي</MenuItem>
        <MenuItem onClick={handleMenuClose}>الإعدادات</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>تسجيل الخروج</MenuItem>
      </Menu>

      {/* Language Menu */}
      <Menu
        anchorEl={languageAnchor}
        open={Boolean(languageAnchor)}
        onClose={handleLanguageClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }}
      >
        <MenuItem onClick={handleLanguageClose}>العربية</MenuItem>
        <MenuItem onClick={handleLanguageClose}>English</MenuItem>
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}