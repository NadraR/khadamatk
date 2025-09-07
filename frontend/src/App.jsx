import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FontProvider from './components/FontProvider';
import ErrorBoundary from './components/ErrorBoundary';

// Auth & Layout
import AuthPage from './pages/AuthPage';
import Layout from './Layout';
import OAuthCallback from "./pages/OAuthCallback";

// Home pages
import Home from './pages/Home';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import About from './pages/About';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import UsersPage from './pages/admin/UsersPage';
import ServicesPage from './pages/admin/ServicesPage';
import OrdersPage from './pages/admin/OrdersPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import AdminLayout from './layouts/AdminLayout';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';

// Service-related pages
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';
import Orders from './pages/Orders';
import OrderPage from './pages/OrderPage';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';

// General pages
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';
import LocationPage from './pages/LocationPage';
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import InvoiceDetails from "./pages/InvoiceDetails";
import WorkerProfileCompletion from "./pages/WorkerProfileCompletion";
import FontTest from "./components/FontTest";

// ✅ Protected Route Component for Admin
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" />;
};

function App() {
  // redirect handling (optional from your second file)
  React.useEffect(() => {
    const isAuthenticated = localStorage.getItem('access') && localStorage.getItem('user');
    if (window.location.pathname === '/auth' && isAuthenticated) {
      window.history.replaceState(null, '', '/');
    }
  }, []);

  return (
    <FontProvider>
      <AdminAuthProvider>
        <Routes>
          {/* Auth */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/oauth2callback" element={<OAuthCallback />} />
          <Route path="/worker" element={<WorkerProfileCompletion />} />
          <Route path="/worker-profile-completion" element={<WorkerProfileCompletion />} />

        {/* Home */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
        {/* <Route path="/homeClient/:id" element={<Layout><HomeClient /></Layout>} /> */}
        {/* <Route path="/home-client" element={<Layout><HomeClient /></Layout>} /> */}
        {/* <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} /> */}
        {/* <Route path="/homeProvider/:id" element={<Layout><HomeProvider /></Layout>} /> */}
        <Route path="/worker/:id" element={<Layout><HomeProvider /></Layout>} />
        <Route path="/adminDashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
          {/* Home */}
          {/* <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
          <Route path="/home-client" element={<Layout><HomeClient /></Layout>} />
          <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} /> */}

          {/* Admin */}
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
          <Route path="/adminDashboard" element={<Navigate to="/admin" />} />

          {/* Services */}
          <Route path="/service/:id" element={<Layout><ServiceDetails /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/order" element={<Layout><OrderPage /></Layout>} />
          <Route path="/order-page" element={<Layout><OrderPage /></Layout>} />
          <Route path="/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/reviews/:serviceId" element={<Layout><Reviews /></Layout>} />
          <Route path="/ratings/:serviceId" element={<Layout><Ratings /></Layout>} />

          {/* General */}
          <Route path="/clients" element={<Layout><Clients /></Layout>} />
          <Route path="/settings" element={<Layout><Settings /></Layout>} />

          {/* Categories */}
          <Route path="/category/painting" element={<Layout><Painting /></Layout>} />
          <Route path="/category/carpentry" element={<Layout><Carpentry /></Layout>} />
          <Route path="/category/electricity" element={<Layout><Electricity /></Layout>} />
          <Route path="/category/plumbing" element={<Layout><Plumbing /></Layout>} />

          {/* Location */}
          <Route path="/location" element={<ErrorBoundary><LocationPage /></ErrorBoundary>} />
          <Route path="/location/my-location" element={<ErrorBoundary><LocationPage /></ErrorBoundary>} />

          {/* Messages */}
          <Route path="/messages" element={<Layout><MessagesPage /></Layout>} />

          {/* Notifications */}
          <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />

          {/* Invoice Details */}
          <Route path="/invoice/:id" element={<Layout><InvoiceDetails /></Layout>} />

          {/* Font Test (Development) */}
          <Route path="/font-test" element={<Layout><FontTest /></Layout>} />
        </Routes>
      </AdminAuthProvider>
    </FontProvider>
  );
}

export default App;
