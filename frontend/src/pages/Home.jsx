import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Slider from '../components/Slider';
import Stats from '../components/Stats';
import Categories from '../components/Categories';
import Footer from '../components/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
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

export default Home;
