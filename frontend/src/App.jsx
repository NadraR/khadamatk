import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import Services from './pages/Services';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';
import Search from './pages/Search';
import OrderPage from './pages/OrderPage';

// 🔹 Management Pages
import Clients from './pages/Clients';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SystemManagement from './pages/SystemManagement';

// 🔹 Details
import ServiceDetails from './pages/ServiceDetails';
import OrderDetails from './pages/OrderDetails';
import UserDetails from './pages/UserDetails';
// import Invoices from './pages/Invoices';


function App() {
  return (
    <Routes>

      {/* Landing page */}      
      <Route path="/" element={<Layout><Home /></Layout>} />


      {/* Homes */}      
      <Route path="/auth" element={<LoginForm />} />
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
    </Routes>
  );
}

export default App;
