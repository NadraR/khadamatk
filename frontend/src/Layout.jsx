import React from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
