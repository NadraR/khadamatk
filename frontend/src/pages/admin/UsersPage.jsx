import React, { useState } from 'react';
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
  Divider
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
import './UsersPage.css';

// Mock data
const mockUsers = [
  {
    id: '1',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966501234567',
    type: 'client',
    verified: true,
    createdAt: '2024-01-15',
    totalBookings: 12,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'سارة أحمد',
    email: 'sara@example.com',
    phone: '+966501234568',
    type: 'provider',
    verified: false,
    createdAt: '2024-02-10',
    totalBookings: 45,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'محمد علي',
    email: 'mohammed@example.com',
    phone: '+966501234569',
    type: 'provider',
    verified: true,
    createdAt: '2024-01-20',
    totalBookings: 67,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '4',
    name: 'فاطمة السعيد',
    email: 'fatima@example.com',
    phone: '+966501234570',
    type: 'client',
    verified: true,
    createdAt: '2024-01-25',
    totalBookings: 8,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'خالد النجار',
    email: 'khalid@example.com',
    phone: '+966501234571',
    type: 'provider',
    verified: false,
    createdAt: '2024-02-05',
    totalBookings: 23,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
  }
];

export default function UsersPage() {
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

  const getStatusChip = (verified) => {
    if (verified) {
  return (
        <Chip
          icon={<ViewIcon sx={{ fontSize: '14px !important' }} />}
          label="موثق"
          sx={{
            backgroundColor: '#1A1A1A',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
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
          sx={{
            backgroundColor: '#F5F5F5',
            color: '#666666',
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
            '& .MuiChip-label': {
              px: 1.5
            }
          }}
        />
      );
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || user.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAFAFA',
      direction: 'rtl'
    }}>
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
                      {getStatusChip(user.verified)}
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
                          sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: '#F0F0F0' }
                          }}
                        >
                          <ViewIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton 
                  size="small"
                          sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: '#F0F0F0' }
                          }}
                        >
                          <EditIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <IconButton 
                  size="small"
                          sx={{ 
                            color: '#666',
                            '&:hover': { backgroundColor: '#F0F0F0' }
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: 18 }} />
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
    </Box>
  );
}