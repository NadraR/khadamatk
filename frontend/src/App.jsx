import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FontProvider from './components/FontProvider';
import FontOptimizer from './components/FontOptimizer';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';

// Auth & Layout
import AuthPage from './pages/AuthPage';
import AdminLogin from './pages/admin/AdminLogin';
import Layout from './Layout';
import OAuthCallback from "./pages/OAuthCallback";

// Home pages
import Home from './pages/Home';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import ServicesPage from './pages/admin/ServicesPage';
import OrdersPage from './pages/admin/OrdersPage';
import InvoicesPage from './pages/admin/InvoicesPage';
import SettingsPage from './pages/admin/SettingsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import RatingsPage from './pages/admin/RatingsPage';
import ReviewsPage from './pages/admin/ReviewsPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminLogsPage from './pages/admin/AdminLogsPage';
import About from './pages/About';

// Service-related pages
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';
import Orders from './pages/Orders';
import OrderPage from './pages/OrderPage';
import TrackOrder from './pages/TrackOrder';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';

// Admin-related pages
import Clients from './pages/Clients';
import Settings from './pages/Settings';

// Category pages
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';

// Location & Chat
import LocationPage from './pages/LocationPage';
import ErrorBoundary from './components/ErrorBoundary';
// import ChatBox from './components/ChatBox';
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import InvoiceDetails from "./pages/InvoiceDetails";
import WorkerProfileCompletion from "./pages/WorkerProfileCompletion";
import FontTest from "./components/FontTest";

function App() {
  console.log('[DEBUG] App component rendering, current path:', window.location.pathname);
  
  // Prevent redirects to auth page only for authenticated users
  React.useEffect(() => {
    console.log('[DEBUG] App useEffect running, current path:', window.location.pathname);
    
    const isAuthenticated = localStorage.getItem('access') && localStorage.getItem('user');
    
    // Check if we're being redirected to auth but user is already authenticated
    if (window.location.pathname === '/auth' && isAuthenticated) {
      console.log('[DEBUG] App: User is authenticated, redirecting from /auth to /');
      window.history.replaceState(null, '', '/');
    }

    const handleBeforeUnload = (e) => {
      if (window.location.pathname === '/auth' && isAuthenticated) {
        e.preventDefault();
        window.history.replaceState(null, '', '/');
        return '';
      }
    };

    const handlePopState = () => {
      if (window.location.pathname === '/auth' && isAuthenticated) {
        window.history.replaceState(null, '', '/');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <CustomThemeProvider>
      <AdminAuthProvider>
        <FontProvider>
          <FontOptimizer />
          <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/worker" element={<WorkerProfileCompletion />} />
        <Route path="/worker-profile-completion" element={<WorkerProfileCompletion />} />

        {/* Home */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
        <Route path="/home-client" element={<Layout><HomeClient /></Layout>} />
        <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        
        {/* Admin Pages */}
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/services" element={<ServicesPage />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/invoices" element={<InvoicesPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/ratings" element={<RatingsPage />} />
        <Route path="/admin/reviews" element={<ReviewsPage />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/logs" element={<AdminLogsPage />} />
        <Route path="/admin/stats" element={<StatisticsPage />} />
        <Route path="/admin/profile" element={<AdminDashboard />} />
        <Route path="/about" element={<Layout><About /></Layout>} />

        {/* Services */}
        <Route path="/service/:id" element={<Layout><ServiceDetails /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/order" element={<Layout><OrderPage /></Layout>} />
        <Route path="/order-page" element={<Layout><OrderPage /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
        <Route path="/orders/:id" element={<Layout><Orders /></Layout>} />
        <Route path="/track-order" element={<Layout><TrackOrder /></Layout>} />
        <Route path="/track-orders" element={<Layout><TrackOrder /></Layout>} />
        <Route path="/reviews/:serviceId" element={<Layout><Reviews /></Layout>} />
        <Route path="/ratings/:serviceId" element={<Layout><Ratings /></Layout>} />

        {/* Admin */}
        <Route path="/clients" element={<Layout><Clients /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />

        {/* Categories */}
        <Route path="/category/painting" element={<Layout><Painting /></Layout>} />
        <Route path="/category/carpentry" element={<Layout><Carpentry /></Layout>} />
        <Route path="/category/electricity" element={<Layout><Electricity /></Layout>} />
        <Route path="/category/plumbing" element={<Layout><Plumbing /></Layout>} />
        <Route path="/oauth2callback" element={<OAuthCallback />} />

        {/* Location (without Layout wrapper, uses custom navbar) */}
        <Route path="/location" element={<ErrorBoundary><LocationPage /></ErrorBoundary>} />
        <Route path="/location/my-location" element={<ErrorBoundary><LocationPage /></ErrorBoundary>} />                                                                                      

        {/* Messages */}
        <Route path="/messages" element={<Layout><MessagesPage /></Layout>} />

        {/* Notifications */}
        <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />

        {/* Invoice Details */}
        <Route path="/invoice/:id" element={<Layout><InvoiceDetails /></Layout>} />
        <Route path="/invoice-details/:id" element={<Layout><InvoiceDetails /></Layout>} />

        {/* Font Test (Development) */}
        <Route path="/font-test" element={<Layout><FontTest /></Layout>} />

        {/* Chat */}
        {/* <Route path="/chat" element={<Layout><ChatBox /></Layout>} /> */}
          </Routes>
        </FontProvider>
      </AdminAuthProvider>
    </CustomThemeProvider>
  );
}

export default App;