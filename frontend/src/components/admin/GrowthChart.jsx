import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { dashboardApi } from '../../services/adminApiService';

const GrowthChart = () => {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await dashboardApi.getOrdersTrend();
      if (response.success) {
        // تحويل أسماء الشهور إلى العربية وإضافة حسابات النمو
        const arabicMonths = {
          'January': 'يناير',
          'February': 'فبراير', 
          'March': 'مارس',
          'April': 'أبريل',
          'May': 'مايو',
          'June': 'يونيو',
          'July': 'يوليو',
          'August': 'أغسطس',
          'September': 'سبتمبر',
          'October': 'أكتوبر',
          'November': 'نوفمبر',
          'December': 'ديسمبر'
        };

        const processedData = response.data.map((item, index) => {
          const arabicName = arabicMonths[item.name] || item.name;
          
          // حساب معدل النمو مقارنة بالشهر السابق
          let growthRate = 0;
          if (index > 0) {
            const prevOrders = response.data[index - 1].orders;
            const currentOrders = item.orders;
            if (prevOrders > 0) {
              growthRate = ((currentOrders - prevOrders) / prevOrders) * 100;
            }
          }

          return {
            ...item,
            name: arabicName,
            growthRate: Math.round(growthRate * 10) / 10, // تقريب لرقم عشري واحد
            total: item.orders + item.services
          };
        });

        setTrendData(processedData);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('خطأ في تحميل بيانات النمو');
      console.error('Growth chart error:', err);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color, mb: 0.5 }}
            >
              {entry.name}: {entry.value}
              {entry.dataKey === 'growthRate' && '%'}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            جاري تحميل بيانات النمو...
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

  return (
    <Card sx={{ height: 500 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} >
            معدل النمو والإحصائيات
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>نوع الرسم</InputLabel>
            <Select
              value={chartType}
              label="نوع الرسم"
              onChange={(e) => setChartType(e.target.value)}
            >
              <MenuItem value="line">خطي</MenuItem>
              <MenuItem value="bar">أعمدة</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#0077ff"
                  strokeWidth={3}
                  name="الطلبات"
                  dot={{ fill: '#0077ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#0077ff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="services"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="الخدمات"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="growthRate"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  name="معدل النمو %"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="orders" fill="#0077ff" name="الطلبات" radius={[2, 2, 0, 0]} />
                <Bar dataKey="services" fill="#10b981" name="الخدمات" radius={[2, 2, 0, 0]} />
                <Bar dataKey="total" fill="#f59e0b" name="المجموع" radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </Box>

        {/* إحصائيات سريعة */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {trendData.length > 0 && (
            <>
              <Box sx={{ 
                backgroundColor: '#e3f2fd', 
                padding: '8px 12px', 
                borderRadius: '8px',
                minWidth: '120px'
              }}>
                <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  إجمالي الطلبات
                </Typography>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                  {trendData.reduce((sum, item) => sum + item.orders, 0)}
                </Typography>
              </Box>
              
              <Box sx={{ 
                backgroundColor: '#e8f5e8', 
                padding: '8px 12px', 
                borderRadius: '8px',
                minWidth: '120px'
              }}>
                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>
                  إجمالي الخدمات
                </Typography>
                <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 700 }}>
                  {trendData.reduce((sum, item) => sum + item.services, 0)}
                </Typography>
              </Box>

              <Box sx={{ 
                backgroundColor: '#fff3e0', 
                padding: '8px 12px', 
                borderRadius: '8px',
                minWidth: '120px'
              }}>
                <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600 }}>
                  متوسط النمو
                </Typography>
                <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700 }}>
                  {trendData.length > 1 
                    ? `${Math.round(trendData.slice(1).reduce((sum, item) => sum + item.growthRate, 0) / (trendData.length - 1) * 10) / 10}%`
                    : '0%'
                  }
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GrowthChart;
