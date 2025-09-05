import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import UsersPage from './pages/admin/UsersPage';
import ServicesPage from './pages/admin/ServicesPage';
import OrdersPage from './pages/admin/OrdersPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import AdminLayout from './layouts/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import Layout from './Layout';
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';
import Clients from './pages/Clients';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';
import LocationPage from './pages/LocationPage';

// Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* صفحة تسجيل الدخول / إنشاء حساب */}
        <Route path="/" element={<AuthPage />} />

        {/* صفحات العملاء */}
        <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
        <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="reviews" element={<div>صفحة التقييمات</div>} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="settings" element={<div>صفحة الإعدادات</div>} />
          <Route path="notifications" element={<div>صفحة الإشعارات</div>} />
        </Route>

        {/* Legacy Admin Route - redirect to new admin */}
        <Route path="/adminDashboard" element={<Navigate to="/admin" />} />

      {/* صفحات الخدمات */}
      <Route path="/service/:id" element={<Layout><ServiceDetails /></Layout>} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />
      <Route path="/reviews/:serviceId" element={<Layout><Reviews /></Layout>} />
      <Route path="/ratings/:serviceId" element={<Layout><Ratings /></Layout>} />

      {/* صفحات الإدارة */}
      <Route path="/clients" element={<Layout><Clients /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />

      {/* صفحات الفئات */}
      <Route path="/category/painting" element={<Layout><Painting /></Layout>} />
      <Route path="/category/carpentry" element={<Layout><Carpentry /></Layout>} />
      <Route path="/category/electricity" element={<Layout><Electricity /></Layout>} />
      <Route path="/category/plumbing" element={<Layout><Plumbing /></Layout>} />

        {/* صفحات إضافية */}
        
        {/* Location pages without Layout wrapper - using custom LocationNavbar */}
        <Route path="/location" element={<LocationPage />} />
        <Route path="/location/my-location" element={<LocationPage />} />
      </Routes>
    </AdminAuthProvider>
  );
}

export default App;