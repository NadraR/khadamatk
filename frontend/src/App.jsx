import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './Layout';
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';
import LocationPage from './pages/LocationPage';
import Home from './pages/Home';
import ChatBox from './components/ChatBox';

function App() {
  return (
    <Routes>
      {/* صفحة تسجيل الدخول / إنشاء حساب */}      
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/login" element={<AuthPage />} />

      {/* صفحات العملاء */}
      <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
      <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} />
      <Route path="/adminDashboard" element={<Layout><AdminDashboard /></Layout>} />

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

      {/* ChatBox accessible from any page */}
      <Route path="/chat" element={<Layout><ChatBox /></Layout>} />
    </Routes>
  );
}

export default App;