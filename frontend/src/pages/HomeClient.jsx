import React from 'react';
// import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Slider from '../components/Slider';
import Stats from '../components/Stats';
import Categories from '../components/Categories';
import Footer from '../components/Footer';
import './HomeClient.css';

const HomeClient = () => {
  return (
    <div className="home dashboard">
      {/* <Navbar /> */}
      <div className="main-content">
        <Sidebar />
        <div className="content">
          <Slider />
          <Stats />
          <Categories />
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default HomeClient;
