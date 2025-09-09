import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt
} from 'lucide-react';
import { dashboardApi } from '../../services/adminApiService';
import { useTranslation } from '../../hooks/useTranslation';

const FinancialStats = () => {
  const { t } = useTranslation();
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardApi.getFinancialReport();
      if (response.success) {
        setFinancialData(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('خطأ في تحميل البيانات المالية');
      console.error('Financial stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      case 'refunded':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return t('paid');
      case 'pending':
        return t('pending_status');
      case 'cancelled':
        return t('cancelled');
      case 'refunded':
        return t('refunded');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            جاري تحميل البيانات المالية...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Card>
    );
  }

  const totalAmount = financialData?.by_status?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
  const totalCount = financialData?.by_status?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  const paidAmount = financialData?.by_status?.find(item => item.status === 'paid')?.total || 0;
  const pendingAmount = financialData?.by_status?.find(item => item.status === 'pending')?.total || 0;

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
      border: '1px solid rgba(0,123,255,0.1)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,251,255,0.9) 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' ,height: '40vh'}}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <DollarSign size={24} color="#10b981" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('financial_stats')}
          </Typography>
        </Box>

        {/* إجمالي المبالغ */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            backgroundColor: '#f0f9ff', 
            padding: '16px', 
            borderRadius: '12px',
            border: '1px solid #e0f2fe'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Receipt size={20} color="#0369a1" />
              <Typography variant="subtitle2" sx={{ color: '#0369a1', fontWeight: 600 }}>
                {t('total_invoices_amount')}
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color: '#0369a1', fontWeight: 700 }}>
              {totalAmount.toLocaleString()} ر.س
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              {totalCount} {t('invoice')}
            </Typography>
          </Box>
        </Box>

        {/* تفصيل الحالات */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            {t('details_by_status')}
          </Typography>
          
          {financialData?.by_status?.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={getStatusLabel(item.status)}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(item.status),
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {item.count} {t('invoice')}
                  </Typography>
                  
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: getStatusColor(item.status) }}>
                  {item.total?.toLocaleString() || 0} ر.س
                </Typography>
              </Box>
            </Box>
          )) || (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography sx={{ color: '#666' }}>لا توجد بيانات مالية</Typography>
            </Box>
          )}
        </Box>

       {/* ملخص سريع */}
       <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    p: 1.5,
    border: "1px solid #ddd",
    borderRadius: "8px",
  }}
>
  {/* العمود الأول */}
  <Typography sx={{ fontWeight: 600 }}>{t('paid')}</Typography>

  {/* العمود الثاني */}
  <Typography sx={{ fontWeight: 600 }}>{paidAmount} ر.س</Typography>
</Box>

<Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    p: 1.5,
    border: "1px solid #ddd",
    borderRadius: "8px",
    mt: 1.5,
  }}
>
  {/* العمود الأول */}
  <Typography sx={{ fontWeight: 600 }}>{t('pending_status')}</Typography>

  {/* العمود الثاني */}
  <Typography sx={{ fontWeight: 600 }}>{pendingAmount} ر.س</Typography>
</Box>

        {/* جزء الأرباح */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            {t('profit_breakdown')}
          </Typography>
          
          {financialData?.invoices?.map((invoice, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t('invoice')} #{invoice.id}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {invoice.customer_name || t('undefined_user')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">
                  {t('total_amount')}:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {invoice.amount?.toLocaleString()} ر.س
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#1976d2' }}>
                  {t('system_profit')} (5%):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  {((invoice.amount || 0) * 0.05).toLocaleString()} ر.س
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                  {t('customer_profit')} (95%):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                  {((invoice.amount || 0) * 0.95).toLocaleString()} ر.س
                </Typography>
              </Box>
            </Box>
          ))}
          
          {(!financialData?.invoices || financialData.invoices.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: '#666' }}>
                {t('no_invoices_available')}
              </Typography>
            </Box>
          )}
        </Box>

      </CardContent>
    </Card>
  );
};

export default FinancialStats;
