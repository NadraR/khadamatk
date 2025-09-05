import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { loadGoogleFonts } from './utils/fontLoader';
import FontProvider from './components/FontProvider';

// Load Google Fonts globally
loadGoogleFonts();

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
import MessagesPage from "./pages/MessagesPage";
import FontTest from "./components/FontTest";

// **Invoices & Booking pages**
import Invoices from './pages/Invoices';
import InvoiceDetails from './pages/InvoiceDetails';
import BookingDetails from './pages/BookingDetails';

function App() {
  return (
    <FontProvider>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Home */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
        <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} />
        <Route path="/adminDashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />

        {/* Services */}
        <Route path="/service/:id" element={<Layout><ServiceDetails /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
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

        {/* OAuth callback */}
        <Route path="/oauth2callback" element={<OAuthCallback />} />

        {/* Location (without Layout wrapper, uses custom navbar) */}
        <Route path="/location" element={<ErrorBoundary><LocationPage /></ErrorBoundary>} />
        <Route path="/location/my-location" element={<ErrorBoundary><LocationPage /></ErrorBoundary>} />

        {/* Messages */}
        <Route path="/messages" element={<Layout><MessagesPage /></Layout>} />

        {/* Font Test (Development) */}
        <Route path="/font-test" element={<Layout><FontTest /></Layout>} />

        {/* Chat */}
        {/* <Route path="/chat" element={<Layout><ChatBox /></Layout>} /> */}

        {/* ====== Invoices & Booking Routes ====== */}
        <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
        <Route path="/invoices/:id" element={<Layout><InvoiceDetails /></Layout>} />
        <Route path="/bookings/:id" element={<Layout><BookingDetails /></Layout>} />

      </Routes>
    </FontProvider>
  );
}

export default App;
