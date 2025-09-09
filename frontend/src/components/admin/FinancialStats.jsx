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

const FinancialStats = () => {
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
        return 'مدفوعة';
      case 'pending':
        return 'معلقة';
      case 'cancelled':
        return 'ملغية';
      case 'refunded':
        return 'مستردة';
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
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' ,height: '40vh'}}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <DollarSign size={24} color="#10b981" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            الإحصائيات المالية
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
                إجمالي الفواتير
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ color: '#0369a1', fontWeight: 700 }}>
              {totalAmount.toLocaleString()} ر.س
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
              {totalCount} فاتورة
            </Typography>
          </Box>
        </Box>

        {/* تفصيل الحالات */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            تفصيل حسب الحالة
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
                    {item.count} فاتورة
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
  <Typography sx={{ fontWeight: 600 }}>مدفوعة</Typography>

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
  <Typography sx={{ fontWeight: 600 }}>معلقة</Typography>

  {/* العمود الثاني */}
  <Typography sx={{ fontWeight: 600 }}>{pendingAmount} ر.س</Typography>
</Box>



      </CardContent>
    </Card>
  );
};

export default FinancialStats;
