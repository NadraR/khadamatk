import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BsTools, BsTruck, BsBrush, BsHammer, BsPaintBucket,
  BsSearch, BsPeople, BsCheckCircle, BsStarFill
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ImageTicker from "../components/ImageTicker";
import assemblyImg from "../images/assembly.jpg";
import movingImg from "../images/moving.jpeg";
import cleaningImg from "../images/cleaning.jpg";
import repairsImg from "../images/repairs.jpg";
import paintingImg from "../images/Painting.jpg";
import searchImage from "../images/search.jpg";

const services = [
  { key: "assembly", title: "Assembly", icon: <BsTools />, img: assemblyImg, desc: "Assemble or disassemble furniture items with care." },
  { key: "moving", title: "Moving", icon: <BsTruck />, img: movingImg, desc: "Help with packing, moving heavy items, and safe transport." },
  { key: "cleaning", title: "Cleaning", icon: <BsBrush />, img: cleaningImg, desc: "Deep home cleaning, regular housekeeping, and office cleanup." },
  { key: "repairs", title: "Home Repairs", icon: <BsHammer />, img: repairsImg, desc: "Fix leaks, furniture, small electrical jobs, and more." },
  { key: "painting", title: "Painting", icon: <BsPaintBucket />, img: paintingImg, desc: "Interior & exterior painting with premium quality." }
];

const projects = [
  { title: "تركيب دولاب", img: assemblyImg, price: "150 ج.م" },  
  { title: "تنظيف شقة", img: cleaningImg, price: "250 ج.م" },
  { title: "دهان غرفة", img: paintingImg, price: "400 ج.م" },
  { title: "نقل أثاث", img: movingImg, price: "600 ج.م" },
];

const Testimonial = ({ name, quote }) => (
  <div className="testimonial h-100 text-center">
    <div className="mb-2">
      {[...Array(5)].map((_, i) => <BsStarFill key={i} className="text-warning" />)}
    </div>
    <p className="text-muted">"{quote}"</p>
    <div className="mt-2 fw-bold">{name}</div>
  </div>
);

const Home = () => {
  const injected = useRef(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeService, setActiveService] = useState(() => services[0]);

  useEffect(() => {
    if (injected.current) return;
    const css = `
    :root {
      --primary:#0077ff;
      --primary-dark:#0056b3;
      --gradient:linear-gradient(135deg, #0077ff, #4da6ff);
      --bg:#f9fbff;
      --muted:#6b7280;
    }
    body { background:var(--bg); color:#0f172a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }

    /* Navbar */
    .navbar-brand { font-size:1.5rem; letter-spacing:.5px; }

    /* Tabs */
    .nav-tabs .nav-link { display:flex; align-items:center; gap:.5rem; font-weight:500; color:#374151; }
    .nav-tabs .nav-link.active { color:var(--primary) !important; border-bottom:3px solid var(--primary); }

    /* Service Box */
    .service-box { display:flex; gap:1.5rem; background:#fff; border-radius:1rem; padding:2rem; align-items:center; box-shadow:0 6px 18px rgba(0,0,0,.05); }
    .service-box img { width:320px; border-radius:1rem; object-fit:cover; }

    /* Popular Projects */
    .popular-card { border-radius:1rem; overflow:hidden; background:#fff; box-shadow:0 6px 18px rgba(0,0,0,.05); transition:.3s; }
    .popular-card:hover { transform:translateY(-6px); box-shadow:0 10px 25px rgba(0,0,0,.1); }
    .popular-card img { width:100%; height:180px; object-fit:cover; }
    .popular-card-body { padding:1rem; }

    /* Steps & Why Choose */
    .step { background:#fff; padding:1.8rem; border-radius:1rem; box-shadow:0 4px 14px rgba(0,0,0,.05); transition:.3s; }
    .step:hover { transform:translateY(-5px); }

    /* Testimonials */
    .testimonial { background:#fff; border-radius:1rem; padding:1.5rem; box-shadow:0 4px 14px rgba(0,0,0,.05); transition:.3s; }
    .testimonial:hover { transform:translateY(-5px); }

    /* CTA Button */
    .btn-cta {
      background: var(--gradient);
      color: #fff !important;
      border:none;
      padding:.75rem 2rem;
      border-radius:50px;
      font-weight:600;
      transition:.3s;
    }
    .btn-cta:hover { opacity:.9; transform:scale(1.05); }

    footer { background:#fff; padding:2rem 0; margin-top:3rem; border-top:1px solid #e5e7eb; }
    
    /* Pulse Animation for Join Button */
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 4px 15px rgba(125, 211, 252, 0.4);
      }
      50% {
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(125, 211, 252, 0.6);
      }
    }
    `;
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    injected.current = true;
  }, []);

  return (
    <div>
      <Navbar />
      
      {/* Join as Service Provider Banner */}
      <div className="container-fluid py-3" style={{ 
        background: 'linear-gradient(135deg,rgb(199, 212, 228),rgb(125, 185, 245))', 
        borderBottom: '3px solid #fff',
        boxShadow: '0 4px 15px rgba(7, 52, 102, 0.3)'
      }}>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-8 text-center">
              <div className="d-flex align-items-center justify-content-center gap-3">
                <div className="text-white">
                  <i className="bi bi-star-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                  <span className="fw-bold" style={{ fontSize: '1.2rem' }}>
                    {t("joinBannerText")}
                  </span>
                </div>
                <button
                  className="btn btn-lg fw-bold px-4 py-2 ms-3"
                  onClick={() => navigate('/auth')}
                  style={{
                    borderRadius: '50px',
                    backgroundColor: '#7dd3fc',
                    color: '#0f172a',
                    boxShadow: '0 4px 15px rgba(125, 211, 252, 0.4)',
                    transition: 'all 0.3s ease',
                    border: '3px solid #fff',
                    animation: 'pulse 2s infinite'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05) translateY(-2px)';
                    e.target.style.backgroundColor = '#38bdf8';
                    e.target.style.boxShadow = '0 8px 25px rgba(125, 211, 252, 0.6)';
                    e.target.style.animation = 'none';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1) translateY(0)';
                    e.target.style.backgroundColor = '#7dd3fc';
                    e.target.style.boxShadow = '0 4px 15px rgba(125, 211, 252, 0.4)';
                    e.target.style.animation = 'pulse 2s infinite';
                  }}
                >
                  <i className="bi bi-plus-circle-fill me-2"></i>
                  {t("joinNowButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search Bar Section */}
      <section className="container my-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="text-center mb-3">
              <h2 className="fw-bold text-primary mb-2">
                {t("searchTitle")}
              </h2>
              <p className="text-muted">
                {t("searchSubtitle")}
              </p>
            </div>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Image Ticker Section */}
      <section className="my-5">
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary">
              {t("servicesTitle")}
            </h3>
            <p className="text-muted">
              {t("servicesSubtitle")}
            </p>
          </div>
          <ImageTicker />
        </div>
      </section>

      <section className="container my-5">
        <ul className="nav nav-tabs justify-content-center">
          {services.map(s => (
            <li className="nav-item" key={s.key}>
              <button
                className={`nav-link ${activeService.key === s.key ? "active" : ""}`}
                onClick={() => setActiveService(s)}
              >
                {s.icon} {s.title}
              </button>
            </li>
          ))}
        </ul>

        <div className="service-box mt-4">
            <img src={activeService.img} alt={activeService.title} />          <div>
            <h4 className="fw-bold text-primary">{activeService.title}</h4>
            <p className="text-muted">{activeService.desc}</p>
            <button
              className="btn btn-cta mt-3"
              onClick={() => {
                // Save service to localStorage
                const serviceData = {
                  id: activeService.key,
                  name: { ar: activeService.title, en: activeService.title },
                  category: "home",
                  searchTerm: activeService.title,
                  selectedAt: new Date().toISOString()
                };
                localStorage.setItem('selectedService', JSON.stringify(serviceData));
                console.log('Service saved to localStorage:', serviceData);
                
                navigate("/location", { 
                  state: { selectedService: serviceData } 
                });
              }}
            >
              ابحث عن مزودي هذه الخدمة
            </button>
          </div>
        </div>
      </section>

      <section className="container my-5">
        <h3 className="mb-4 text-center fw-bold">Popular Projects</h3>
        <div className="row g-4">
          {projects.map((p, i) => (
            <div className="col-sm-6 col-lg-3" key={i}>
              <div className="popular-card h-100">
                <img src={p.img} alt={p.title} />
                <div className="popular-card-body">
                  <h6 className="fw-bold">{p.title}</h6>
                  <p className="text-primary fw-bold">{p.price}</p>
                   <button
    className="btn btn-sm btn-cta w-100"
    onClick={() => {
      // Save service to localStorage
      const serviceData = {
        id: p.title.toLowerCase().replace(/\s+/g, '_'),
        name: { ar: p.title, en: p.title },
        category: "home",
        searchTerm: p.title,
        price: p.price,
        selectedAt: new Date().toISOString()
      };
      localStorage.setItem('selectedService', JSON.stringify(serviceData));
      console.log('Service saved to localStorage:', serviceData);
      
      navigate("/location", { 
        state: { selectedService: serviceData } 
      });
    }}
  >
    ابحث عن مزودي هذه الخدمة
  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

<section className="container my-5">
  <h3 className="text-center mb-5 fw-bold">
    Why choose <span className="text-primary">Khadamatk?</span>
  </h3>

  <div className="row g-4 text-center">
    <div className="col-md-4">
      <div
        className="p-4 h-100 rounded-4 shadow-sm"
        style={{
          background: "#fff",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
          style={{
            width: "60px",
            height: "60px",
            background: "rgba(0,123,255,0.1)",
          }}
        >
          <i className="bi bi-shield-check text-primary" style={{ fontSize: "1.8rem" }}></i>
        </div>
        <h5 className="fw-bold mb-2">1 month quality guarantee</h5>
        <p className="text-muted small mb-0">
          ضمان جودة الخدمة لمدة شهر كامل.
        </p>
      </div>
    </div>

    <div className="col-md-4">
      <div
        className="p-4 h-100 rounded-4 shadow-sm"
        style={{
          background: "#fff",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
          style={{
            width: "60px",
            height: "60px",
            background: "rgba(0,123,255,0.1)",
          }}
        >
          <i className="bi bi-calendar-check text-primary" style={{ fontSize: "1.8rem" }}></i>
        </div>
        <h5 className="fw-bold mb-2">Flexible scheduling</h5>
        <p className="text-muted small mb-0">
          مواعيد مرنة والتزام بالوقت.
        </p>
      </div>
    </div>

    <div className="col-md-4">
      <div
        className="p-4 h-100 rounded-4 shadow-sm"
        style={{
          background: "#fff",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 123, 255, 0.2)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.05)";
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle"
          style={{
            width: "60px",
            height: "60px",
            background: "rgba(0,123,255,0.1)",
          }}
        >
          <i className="bi bi-people-fill text-primary" style={{ fontSize: "1.8rem" }}></i>
        </div>
        <h5 className="fw-bold mb-2">Trusted technicians</h5>
        <p className="text-muted small mb-0">
          فنيين موثوقين وعمال معتمدين.
        </p>
      </div>
    </div>
  </div>
</section>

<section
  className="container my-5 d-flex flex-column align-items-center justify-content-center"
  style={{ 
    background: "rgba(223, 234, 247, 0.75)", 
    width: "100%", 
    minHeight: "80vh"
  }}
>
  <h3 className="text-center mb-4">إزاي تحجز خدمة؟</h3>

  <div className="position-relative d-inline-block">
    <img
      src={searchImage}
      alt="How to book"
      className="img-fluid rounded"
      style={{ 
        width: "50vw", 
        height: "60vh", 
        objectFit: "cover", 
        display: "block", 
        margin: "0 auto" 
      }}
    />

    <div
      className="position-absolute top-50 start-100 translate-middle shadow-lg p-4 rounded text-center"
      style={{
        width: "20vw",
        background: "rgba(255, 255, 255, 0.55)", 
        backdropFilter: "blur(12px)", 
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        color: "#333",
      }}
    >
      <div className="mb-2">
        <BsSearch size={26} className="text-primary mb-1" />
        <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>
          1. اختار الخدمة
        </h6>
        <p className="text-muted small mb-0">ابحثي عن الخدمة اللي محتاجاها.</p>
      </div>

      <div className="mb-2">
        <BsPeople size={26} className="text-primary mb-1" />
        <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>
          2. اختار الفني
        </h6>
        <p className="text-muted small mb-0">شوڤي الملف الشخصي والتقييمات.</p>
      </div>

      <div>
        <BsCheckCircle size={26} className="text-primary mb-1" />
        <h6 className="fw-bold mb-1" style={{ fontSize: "0.9rem" }}>
          3. استمتع بالخدمة
        </h6>
        <p className="text-muted small mb-0">
          الفني يوصلك في الميعاد وتستمتعي بخدمة ممتازة.
        </p>
      </div>
    </div>
  </div>
</section>




      <section className="container my-5">
        <h3 className="text-center mb-4">آراء عملائنا</h3>
        <div className="row g-4">
          <div className="col-md-4"><Testimonial name="سارة" quote="خدمة ممتازة وسريعة جدًا." /></div>
          <div className="col-md-4"><Testimonial name="محمد" quote="الفني محترف وأسعاره مناسبة." /></div>
          <div className="col-md-4"><Testimonial name="أحمد" quote="أفضل منصة حجز خدمات منزلية." /></div>
        </div>
      </section>
    </div>
  );
};

export default Home;
