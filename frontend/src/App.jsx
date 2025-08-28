import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm'; 
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetails from './pages/ServiceDetails';
import Services from './pages/Services';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import Ratings from './pages/Ratings';
import Search from './pages/Search';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Layout from './Layout';
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';
import Invoices from './pages/Invoices';
import UserDetails from './pages/UserDetails';
import OrderDetails from './pages/OrderDetails';
import Users from './pages/Users';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />

      <Route
        path="/homeClient"
        element={
          <Layout>
            <HomeClient />
          </Layout>
        }
      />

      <Route
        path="/homeProvider"
        element={
          <Layout>
            <HomeProvider />
          </Layout>
        }
      />

      <Route
      path='/users'
      element={
          <Layout>
            <Users />
          </Layout>
        }
      />

      <Route
        path="/adminDashboard"
        element={
          <Layout>
            <AdminDashboard />
          </Layout>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <Layout>
            <OrderDetails />
          </Layout>
        }
      />

      <Route
        path="/admin/services/:id"
        element={
          <Layout>
            <ServiceDetails />
          </Layout>
        }
      />

      <Route
        path="/services"
        element={
          <Layout>
            <Services />
          </Layout>
        }
      />

      <Route
        path="/orders"
        element={
          <Layout>
            <Orders />
          </Layout>
        }
      />

      <Route
        path="/reviews"
        element={
          <Layout>
            <Reviews />
          </Layout>
        }
      />

      <Route
        path="/ratings"
        element={
          <Layout>
            <Ratings />
          </Layout>
        }
      />

      <Route
        path="/clients"
        element={
          <Layout>
            <Clients />
          </Layout>
        }
      />

      <Route
        path="/settings"
        element={
          <Layout>
            <Settings />
          </Layout>
        }
      />

      <Route
        path="/category/painting"
        element={
          <Layout>
            <Painting />
          </Layout>
        }
      />

      <Route
        path="/category/carpentry"
        element={
          <Layout>
            <Carpentry />
          </Layout>
        }
      />

      <Route
        path="/category/electricity"
        element={
          <Layout>
            <Electricity />
          </Layout>
        }
      />

      <Route
        path="/category/plumbing"
        element={
          <Layout>
            <Plumbing />
          </Layout>
        }
      />

      <Route
        path="/search"
        element={
          <Layout>
            <Search />
          </Layout>
        }
      />

      <Route
        path="/invoices"
        element={
          <Layout>
            <Invoices />
          </Layout>
        }
      />

      <Route path="/users/:id" element={<Layout> <UserDetails /> </Layout>} />
    </Routes>
  );
}

export default App;
