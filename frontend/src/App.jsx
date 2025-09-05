import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Auth & Layout
import AuthPage from './pages/AuthPage';
import Layout from './Layout';

// Home pages
import Home from './pages/Home';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/AdminDashboard';

// Service-related pages
import UserDetails from './pages/UserDetails';
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';
import EditProfile from './pages/EditProfile';

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
import ChatBox from './components/ChatBox';

function App() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<AuthPage />} />

      {/* Home */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      {/* <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} /> */}
      <Route path="/homeClient/:id" element={<Layout><HomeClient /></Layout>} />
      <Route path="/worker/:id" element={<Layout><HomeProvider /></Layout>} />
      <Route path="/adminDashboard" element={<Layout><AdminDashboard /></Layout>} />

      {/* Services */}
      <Route path="/userdetails/:id" element={<Layout><UserDetails /></Layout>} />
      <Route path="/service/:id" element={<Layout><ServiceDetails /></Layout>} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />
      <Route path="/reviews/:serviceId" element={<Layout><Reviews /></Layout>} />
      <Route path="/ratings/:serviceId" element={<Layout><Ratings /></Layout>} />
      <Route path="/edit-profile" element={<Layout><EditProfile /></Layout>} />
      

      {/* Admin */}
      <Route path="/clients" element={<Layout><Clients /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />

      {/* Categories */}
      <Route path="/category/painting" element={<Layout><Painting /></Layout>} />
      <Route path="/category/carpentry" element={<Layout><Carpentry /></Layout>} />
      <Route path="/category/electricity" element={<Layout><Electricity /></Layout>} />
      <Route path="/category/plumbing" element={<Layout><Plumbing /></Layout>} />

      {/* Location (without Layout wrapper, uses custom navbar) */}
      <Route path="/location" element={<LocationPage />} />
      <Route path="/location/my-location" element={<LocationPage />} />

      {/* Chat */}
      <Route path="/chat" element={<Layout><ChatBox /></Layout>} />
    </Routes>
  );
}

export default App;
