import React, { useEffect, useRef, useState } from 'react';
import { FaPause, FaPlay, FaForward, FaBackward } from 'react-icons/fa';
import './ImageTicker.css';

const ImageTicker = () => {
  const tickerRef = useRef(null);
  const [speed] = useState(1);


  const images = [
    {
      src: "/images/plumber-2.jpeg",
      alt: "خدمات السباكة"
    },
    {
      src: "/images/e365f39acaa5b0ea0285e39eae8cdd34_electrical-engineer-1000-c-90.jpg",
      alt: "خدمات الكهرباء"
    },
    {
      src: "/images/pexels-thijsvdw-1094767.jpg",
      alt: "خدمات النجارة"
    },
    {
      src: "/images/pexels-kseniachernaya-5767799.jpg",
      alt: "خدمات الدهان"
    },
    {
      src: "/images/House-Cleaning.jpg",
      alt: "خدمات التنظيف"
    },
    {
      src: "/images/AC.jpg",
      alt: "خدمات التكييف"
    },
    {
      src: "/images/repair-service-provider.jpg",
      alt: "خدمات الصيانة"
    },
    {
      src: "/images/plumber-2.jpeg",
      alt: "خدمات السباكة"
    }
  ];

  useEffect(() => {
    const tickerTrack = tickerRef.current;
    if (!tickerTrack) return;

    let animation;
    let position = 0;

    const animate = () => {
      position -= speed;
      
      if (position < -tickerTrack.scrollWidth / 2) {
        position = 0;
      }
      
      tickerTrack.style.transform = `translateX(${position}px)`;
      animation = requestAnimationFrame(animate);
    };

    animation = requestAnimationFrame(animate);

    return () => {
      if (animation) {
        cancelAnimationFrame(animation);
      }
    };
  }, [speed]);





  return (
    <div className="ticker-container">

      
      <div className="ticker-track" ref={tickerRef}>
        {images.map((image, index) => (
          <div key={index} className="ticker-item">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
            />
          </div>
        ))}
        {/* نسخة مكررة للاستمرارية */}
        {images.map((image, index) => (
          <div key={`copy-${index}`} className="ticker-item">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTicker;