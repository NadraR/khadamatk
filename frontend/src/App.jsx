import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Services from './pages/Services';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Layout from './Layout';
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';
import HomeClient from './pages/HomeClient';
import HomeProvider from './pages/HomeProvider';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetails from './pages/ServiceDetails';

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
          path="homeProvider"
          element={
            <Layout>
              <HomeProvider />
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
          path="/service/:id"
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
    </Routes>
  );
}

export default App;