import React, { useState } from 'react';
import './Slider.css';
import plumbingImg from "../images/plumbing.jpg";
import electricImg from "../images/electric.jpg";
import paintingImg from "../images/painting.jpg";
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';

const Slider = () => {
  const { t } = useTranslation();

  const slides = [
    {
      img: plumbingImg,
      discount: '20%',
      title: t("slider.plumbingTitle"),
      text: t("slider.plumbingText"),
    },
    {
      img: electricImg,
      discount: '15%',
      title: t("slider.electricTitle"),
      text: t("slider.electricText"),
    },
    {
      img: paintingImg,
      discount: '10%',
      title: t("slider.paintingTitle"),
      text: t("slider.paintingText"),
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
            <Link style={{textDecoration:"none"}} to="/orders" className="btn">
              {t("slider.bookNow")}
            </Link>
          </div>
        </div>

        <button className="arrow left" onClick={prevSlide}>❮</button>
        <button className="arrow right" onClick={nextSlide}>❯</button>
      </div>
    </div>
  );
};

export default Slider;
