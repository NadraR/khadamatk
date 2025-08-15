import React, { useState } from 'react';
import './Slider.css';
import plumbingImg from "../images/plumbing.jpg";
import electricImg from "../images/electric.jpg";
import paintingImg from "../images/painting.jpg";

const Slider = () => {
  const slides = [
    {
      img: plumbingImg,
      discount: '20%',
      title: 'خدمات السباكة المتخصصة',
      text: 'احصل على أفضل خدمات السباكة مع ضمان جودة وسرعة في الاستجابة',
    },
    {
      img: electricImg,
      discount: '15%',
      title: 'خدمات الكهرباء',
      text: 'أفضل فنيين الكهرباء بأعلى معايير السلامة والجودة',
    },
    {
      img: paintingImg,
      discount: '10%',
      title: 'خدمات الدهانات',
      text: 'ديكورات عصرية وتشطيب ممتاز مع فريق محترف',
    },
  ];

  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="slider">
      <div
        className="slide"
        style={{ backgroundImage: `url(${slides[current].img})` }}
      >
        <div className="slide-content">
          <span className="discount">{slides[current].discount}</span>
          <div className='slide-text'>
          <h2>{slides[current].title}</h2>
          <p>{slides[current].text}</p>
          <button className="btn">احجز الآن</button>
          </div>
        </div>

        <button className="arrow left" onClick={prevSlide}>❮</button>
        <button className="arrow right" onClick={nextSlide}>❯</button>
      </div>
    </div>
  );
};

export default Slider;
