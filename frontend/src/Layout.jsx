import React from 'react';
// import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      {/* <Navbar /> */}
      <main>{children}</main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default Layout;
