import React from 'react';
import { Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
import "bootstrap/dist/css/bootstrap.min.css"; 

// 🔹 Components & Layout
import Layout from './Layout';
import LoginForm from './components/LoginForm'; 

// 🔹 Pages
import Home from './pages/Home';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/AdminDashboard';

// 🔹 Categories
import Cleaning from './pages/Cleaning';
import Gardening from './pages/Gardening';
import Painters from './pages/Painting';
import Carpenters from './pages/Carpentry';
import Electricians from './pages/Electricity';
import Plumbers from './pages/Plumbing';

// 🔹 Core Pages
=======
import AuthPage from './pages/AuthPage';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './Layout';
import ServiceDetails from './pages/ServiceDetails';
>>>>>>> 695cb795c00b2cc50d3e7dfea8a771c8240c4eea
import Services from './pages/Services';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';
<<<<<<< HEAD
import Search from './pages/Search';
import OrderPage from './pages/OrderPage';

// 🔹 Management Pages
=======
>>>>>>> 695cb795c00b2cc50d3e7dfea8a771c8240c4eea
import Clients from './pages/Clients';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
<<<<<<< HEAD
import SystemManagement from './pages/SystemManagement';

// 🔹 Details
import ServiceDetails from './pages/ServiceDetails';
import OrderDetails from './pages/OrderDetails';
import UserDetails from './pages/UserDetails';
// import Invoices from './pages/Invoices';

=======
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';
import LocationPage from './pages/LocationPage';
>>>>>>> 695cb795c00b2cc50d3e7dfea8a771c8240c4eea

function App() {
  return (
    <Routes>
<<<<<<< HEAD

      {/* Landing page */}      
      <Route path="/" element={<Layout><Home /></Layout>} />


      {/* Homes */}      
      <Route path="/login" element={<LoginForm />} />
      <Route path="/homeClient" element={<Layout><HomeClient /></Layout>} />
      <Route path="/homeProvider" element={<Layout><HomeProvider /></Layout>} />
      <Route path="/adminDashboard" element={<Layout><AdminDashboard /></Layout>} />

      {/* Categories */}
      <Route path="/category/cleaning" element={<Layout><Cleaning /></Layout>} />
      <Route path="/category/gardening" element={<Layout><Gardening /></Layout>} />
      <Route path="/category/painters" element={<Layout><Painters /></Layout>} />
      <Route path="/category/carpenters" element={<Layout><Carpenters /></Layout>} />
      <Route path="/category/electricians" element={<Layout><Electricians /></Layout>} />
      <Route path="/category/plumbers" element={<Layout><Plumbers /></Layout>} />

      {/* Services & Orders */}
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />
      <Route path="/orders/:id" element={<Layout><OrderDetails /></Layout>} />
      <Route path="/orderpage" element={<Layout><OrderPage /></Layout>} />
      <Route path="/admin/services/:id" element={<Layout><ServiceDetails /></Layout>} />


      {/* Reviews & Ratings */}
      <Route path="/reviews" element={<Layout><Reviews /></Layout>} />
      <Route path="/ratings" element={<Layout><Ratings /></Layout>} />

      {/* Users & Clients */}
      <Route path="/clients" element={<Layout><Clients /></Layout>} />
      <Route path="/users" element={<Layout><Users /></Layout>} />
      <Route path="/users/:id" element={<Layout><UserDetails /></Layout>} />

      {/* Reports & Settings */}
      <Route path="/reports" element={<Layout><Reports /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
      <Route path="/system-management" element={<Layout><SystemManagement /></Layout>} />

      {/* Search */}
      <Route path="/search" element={<Layout><Search /></Layout>} />

      {/* Optional future route */}
      {/* <Route path="/invoices" element={<Layout><Invoices /></Layout>} /> */}
=======
      {/* صفحة تسجيل الدخول / إنشاء حساب */}
      <Route path="/" element={<AuthPage />} />

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
>>>>>>> 695cb795c00b2cc50d3e7dfea8a771c8240c4eea
    </Routes>
  );
}

export default App;