import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { invoicesApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';
import '../../styles/adminCommon.css';

const InvoicesPage = () => {
  const { t } = useTranslation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await invoicesApi.getInvoices();
      const data = response.success ? response.data : [];
      setInvoices(data);
    } catch (err) {
      setError('فشل في تحميل الفواتير');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoiceId) => {
    try {
      await invoicesApi.markInvoicePaid(invoiceId);
      fetchInvoices();
    } catch (err) {
      setError('فشل في تحديث حالة الفاتورة');
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await invoicesApi.exportInvoicesCSV();
      const blob = response.success ? response.data : null;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'invoices.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('فشل في تصدير الفواتير');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'booking_id', headerName: 'رقم الحجز', width: 100 },
    { field: 'amount', headerName: 'المبلغ', width: 100 },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
          color={params.value === 'paid' ? 'success' : 'warning'}
          size="small"
        />
      ),
    },
    { field: 'issued_at', headerName: 'تاريخ الإصدار', width: 150 },
    { field: 'paid_at', headerName: 'تاريخ الدفع', width: 150 },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      renderCell: (params) => (
        <Box>
          {params.row.status !== 'paid' && (
            <IconButton
              size="small"
              onClick={() => handleMarkPaid(params.row.id)}
              title="تعليم كمدفوعة"
            >
              <CheckCircleIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          جاري تحميل الفواتير...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, pr: { xs: 1, md: 0 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>إدارة الفواتير</Typography>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleExportCSV}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          تصدير CSV
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
          {invoices.map((invoice) => (
            <Paper key={invoice.id} elevation={4} sx={{ p: 2.5, borderRadius: 4, display: 'flex', flexDirection: 'column', gap: 1.5, boxShadow: '0 2px 16px #1976d211', background: '#fff', minHeight: 170 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <ReceiptIcon sx={{ color: '#d32f2f', fontSize: 36 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{t('invoice')} #{invoice.id}</Typography>
                  <Typography variant="body2" color="textSecondary">حجز: {invoice.booking_id} - {invoice.amount} ج.م</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={invoice.status === 'paid' ? 'مدفوعة' : 'غير مدفوعة'} color={invoice.status === 'paid' ? 'success' : 'warning'} size="small" />
                <Chip label={`تاريخ الإصدار: ${invoice.issued_at}`} color="info" size="small" />
                {invoice.paid_at && <Chip label={`تاريخ الدفع: ${invoice.paid_at}`} color="success" size="small" />}
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                {invoice.status !== 'paid' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleMarkPaid(invoice.id)}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    تعليم كمدفوعة
                  </Button>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default InvoicesPage;
