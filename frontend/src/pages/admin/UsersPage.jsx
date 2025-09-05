// src/pages/admin/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import { DataGrid } from '@mui/x-data-grid';
import { adminApiService } from '../../services/adminApiService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  // Advanced search state
  const [search, setSearch] = useState({
    username: '',
    email: '',
    status: '',
    role: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminApiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('فشل في تحميل المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminApiService.activateUser(userId);
      fetchUsers();
    } catch (err) {
      setError('فشل في تفعيل المستخدم');
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await adminApiService.deactivateUser(userId);
      fetchUsers();
    } catch (err) {
      setError('فشل في تعطيل المستخدم');
    }
  };

  const handleSetStaff = async (userId, isStaff) => {
    try {
      await adminApiService.setUserStaff(userId, isStaff);
      fetchUsers();
    } catch (err) {
      setError('فشل في تحديث صلاحيات المستخدم');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'username', headerName: 'اسم المستخدم', width: 150 },
    { field: 'email', headerName: 'البريد الإلكتروني', width: 200 },
    { 
      field: 'role', 
      headerName: 'الدور', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'worker' ? 'عامل' : 'عميل'} 
          color={params.value === 'worker' ? 'primary' : 'secondary'}
          size="small"
        />
      )
    },
    { 
      field: 'is_active', 
      headerName: 'الحالة', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'نشط' : 'معطل'} 
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      )
    },
    { 
      field: 'is_staff', 
      headerName: 'Staff', 
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'نعم' : 'لا'} 
          color={params.value ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small" 
            onClick={() => handleActivateUser(params.row.id)}
            disabled={params.row.is_active}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={() => handleDeactivateUser(params.row.id)}
            disabled={!params.row.is_active}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          جاري تحميل المستخدمين...
        </Typography>
      </Box>
    );
  }

  // Filter users based on search
  const filteredUsers = users.filter(u =>
    (!search.username || u.username?.toLowerCase().includes(search.username.toLowerCase())) &&
    (!search.email || u.email?.toLowerCase().includes(search.email.toLowerCase())) &&
    (!search.status || (search.status === 'active' ? u.is_active : !u.is_active)) &&
    (!search.role || u.role === search.role)
  );

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>إدارة المستخدمين</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setDialogOpen(true)}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 18,
            px: 3,
            py: 1.2,
            background: 'linear-gradient(90deg, #1976d2 60%, #64b5f6 100%)',
            boxShadow: '0 4px 16px #1976d233',
            transition: '0.2s',
            '&:hover': {
              background: 'linear-gradient(90deg, #1565c0 60%, #1976d2 100%)',
              boxShadow: '0 8px 24px #1976d244',
            },
          }}
        >
          إضافة مستخدم جديد
        </Button>
      </Box>

      {/* Advanced Search Bar */}
      <Paper sx={{
        p: 2.5,
        mb: 3,
        borderRadius: 5,
        background: 'linear-gradient(120deg, #f5faff 60%, #e3f2fd 100%)',
        boxShadow: '0 4px 24px 0 #1976d222',
        border: '2px solid #90caf9',
        borderTop: '4px solid #1976d2',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        minHeight: 70,
        transition: 'box-shadow 0.3s, border-color 0.3s',
        '&:hover, &:focus-within': {
          boxShadow: '0 8px 32px 0 #1976d244',
          borderColor: '#1976d2',
          background: 'linear-gradient(120deg, #e3f2fd 60%, #f5faff 100%)',
        },
      }}>
        <TextField
          label="بحث بالاسم"
          value={search.username}
          onChange={e => setSearch(s => ({ ...s, username: e.target.value }))}
          size="small"
          sx={{ minWidth: 180 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon sx={{ color: '#1976d2' }} />
              </InputAdornment>
            )
          }}
        />
        <TextField
          label="بحث بالبريد الإلكتروني"
          value={search.email}
          onChange={e => setSearch(s => ({ ...s, email: e.target.value }))}
          size="small"
          sx={{ minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon sx={{ color: '#0288d1' }} />
              </InputAdornment>
            )
          }}
        />
        <TextField
          select
          label="الحالة"
          value={search.status}
          onChange={e => setSearch(s => ({ ...s, status: e.target.value }))}
          size="small"
          sx={{ minWidth: 120 }}
          SelectProps={{ native: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {search.status === 'active' ? <CheckCircleIcon sx={{ color: 'success.main' }} /> : search.status === 'inactive' ? <BlockIcon sx={{ color: 'error.main' }} /> : <SearchIcon sx={{ color: '#888' }} />}
              </InputAdornment>
            )
          }}
        >
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">معطل</option>
        </TextField>
        <TextField
          select
          label="الدور"
          value={search.role}
          onChange={e => setSearch(s => ({ ...s, role: e.target.value }))}
          size="small"
          sx={{ minWidth: 120 }}
          SelectProps={{ native: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon sx={{ color: '#8e24aa' }} />
              </InputAdornment>
            )
          }}
        >
          <option value="">الكل</option>
          <option value="worker">عامل</option>
          <option value="client">عميل</option>
        </TextField>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2.2,
        }}>
          {filteredUsers.map((user) => (
            <Paper
              key={user.id}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                boxShadow: '0 4px 24px #1976d222',
                background: '#fff',
                minHeight: 180,
                transition: 'box-shadow 0.22s, transform 0.22s',
                '&:hover': {
                  boxShadow: '0 8px 32px #1976d244',
                  transform: 'scale(1.025)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 1 }}>
                <Avatar sx={{ bgcolor: user.is_active ? 'primary.main' : 'grey.400', width: 54, height: 54, fontWeight: 700, fontSize: 24, boxShadow: 3 }}>
                  {user.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 22 }}>{user.username}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: 16 }}>{user.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={user.role === 'worker' ? 'عامل' : 'عميل'} color={user.role === 'worker' ? 'primary' : 'secondary'} size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
                <Chip label={user.is_active ? 'نشط' : 'معطل'} color={user.is_active ? 'success' : 'error'} size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
                <Chip label={user.is_staff ? 'موظف' : 'عادي'} color={user.is_staff ? 'warning' : 'default'} size="medium" sx={{ fontWeight: 700, fontSize: 15 }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto', justifyContent: 'flex-end' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<EditIcon />}
                  onClick={() => handleActivateUser(user.id)}
                  disabled={user.is_active}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 2, fontSize: 15, boxShadow: '0 2px 8px #43a04722' }}
                >
                  تفعيل
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeactivateUser(user.id)}
                  disabled={!user.is_active}
                  sx={{ borderRadius: 2, fontWeight: 700, px: 2, fontSize: 15, boxShadow: '0 2px 8px #e5393522' }}
                >
                  تعطيل
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default UsersPage;