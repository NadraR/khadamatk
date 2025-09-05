import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import FontProvider from './components/FontProvider';

// Auth & Layout
import AuthPage from './pages/AuthPage';
import Layout from './Layout';
import OAuthCallback from "./pages/OAuthCallback";

// Home pages
import Home from './pages/Home';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';

// Service-related pages
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';
import Orders from './pages/Orders';
import OrderPage from './pages/OrderPage';
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
import WorkerProfileCompletion from "./pages/WorkerProfileCompletion";
import FontTest from "./components/FontTest";

function App() {
  const navigate = useNavigate();
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
    <FontProvider>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/worker" element={<WorkerProfileCompletion />} />

        {/* Home */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
        <Route path="/homeClient/:id" element={<Layout><HomeClient /></Layout>} />
        <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} />
        <Route path="/homeProvider/:id" element={<Layout><HomeProvider /></Layout>} />
        <Route path="/worker/:id" element={<Layout><HomeProvider /></Layout>} />
        <Route path="/adminDashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />

        {/* Services */}
        <Route path="/service/:id" element={<Layout><ServiceDetails /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/order" element={<Layout><OrderPage /></Layout>} />
        <Route path="/orders" element={<Layout><Orders /></Layout>} />
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

        {/* Font Test (Development) */}
        <Route path="/font-test" element={<Layout><FontTest /></Layout>} />

        {/* Chat */}
        {/* <Route path="/chat" element={<Layout><ChatBox /></Layout>} /> */}
      </Routes>
    </FontProvider>
  );
}

export default App;
