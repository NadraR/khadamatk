import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginForm from './pages/LoginForm';
import Home from './pages/Home';
import Services from './pages/Services';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import Layout from './Layout';
import Painting from './pages/Painting';
import Carpentry from './pages/Carpentry';
import Electricity from './pages/Electricity';
import Plumbing from './pages/Plumbing';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginForm />} />
      <Route
        path="/home"
        element={
          <Layout>
            <Home />
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
