import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BsTools, BsTruck, BsBrush, BsHammer, BsPaintBucket,
  BsSearch, BsPeople, BsCheckCircle, BsStarFill
} from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import assemblyImg from "../images/assembly.jpg";
import movingImg from "../images/moving.jpeg";
import cleaningImg from "../images/cleaning.jpg";
import repairsImg from "../images/repairs.jpg";
import paintingImg from "../images/Painting.jpg";
import searchImage from "../images/search.jpg";
import apiService from "../services/ApiService";

const Home = () => {
  const injected = useRef(false);
   const navigate = useNavigate();
  const [activeService, setActiveService] = useState(() => services[0]);
   const [clients, setClients] = useState([]);
   const [workers, setWorkers] = useState([]);

     const [selectedClient, setSelectedClient] = useState(null);
     const [selectedWorker, setSelectedWorker] = useState(null);

  const fetchClientDetails = (id) => {
    fetch(`http://127.0.0.1:8000/api/accounts/users/${id}/`)
      .then((res) => res.json())
      .then((data) => setSelectedClient(data))
      .catch((err) => console.error("Error fetching client details:", err));
  };

  const fetchWorkerDetails = (id) => {
    fetch(`http://127.0.0.1:8000/api/accounts/workers/${id}/`)
      .then((res) => res.json())
      .then((data) => setSelectedWorker(data))
      .catch((err) => console.error("Error fetching worker details:", err));
  };


  // useEffect(() => {
  //   const fetchClients = async () => {
  //     try {
  //       const data = await apiService.get("api/accounts/users/");
  //       console.log("DEBUG RESPONSE:", data);
  
  //       if (Array.isArray(data)) {
  //         const clientUsers = data.filter((user) => user.role === "client");
  //         setClients(clientUsers);
  //       } else {
  //         console.error("Unexpected response:", data);
  //       }
  //     } catch (err) {
  //       console.error("❌ Error fetching clients:", err);
  //     }
  //   };
  
  //   fetchClients();
  // }, []);
  
  
  // useEffect(() => {
  //   const fetchWorkers = async () => {
  //     try {
  //       const data = await apiService.get("api/accounts/workers/");
  //       console.log("DEBUG WORKERS RESPONSE:", data);
    
  //       if (Array.isArray(data)) {
  //         setWorkers(data); // دول profiles بتوع العمال
  //       } else {
  //         console.error("Unexpected response:", data);
  //       }
  //     } catch (err) {
  //       console.error("❌ Error fetching workers:", err);
  //     }
  //   };
    

  //   fetchWorkers();
  // }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiService.get("api/accounts/users/");
        console.log("DEBUG USERS RESPONSE:", data);
  
        if (Array.isArray(data)) {
          const clientUsers = data.filter((user) => user.role === "client");
          const workerUsers = data.filter((user) => user.role === "worker");
  
          setClients(clientUsers);
          setWorkers(workerUsers);
        } else {
          console.error("Unexpected response:", data);
        }
      } catch (err) {
        console.error("❌ Error fetching users:", err);
      }
    };
  
    fetchUsers();
  }, []);
  
  

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
    `;
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    injected.current = true;
  }, []);

  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
  <div className="container">
    <a className="navbar-brand fw-bold text-primary" href="#">Khadamatk</a>
    <div>
      {localStorage.getItem("user") ? (
        (() => {
          const user = JSON.parse(localStorage.getItem("user"));
          return (
            <button
  className="btn btn-primary rounded-circle"
  style={{ width: "40px", height: "40px" }}
  onClick={() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      navigate(`/homeClient/${user.id}`);
    } else {
      console.error("User ID not found in localStorage");
    }
  }}
>
  {user?.username
    ? user.username.charAt(0).toUpperCase()
    : (user?.email ? user.email.charAt(0).toUpperCase() : "?")}
</button>


          );
        })()
      ) : (
        <>
          <button
            className="btn btn-outline-primary me-2"
            onClick={() => navigate("/login")}
          >
            تسجيل الدخول
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/register")}
          >
            إنشاء حساب
          </button>
        </>
      )}
    </div>
  </div>
</nav>



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
    onClick={() => navigate("/orderpage", { state: { service: p } })}
  >
    احجز الآن
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

      <div>
  <h2>Clients</h2>
  <ul>
    {clients.map((client) => (
      <li key={client.id} style={{ marginBottom: "10px" }}>
        {client.username}{" "}
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => navigate(`/homeClient/${client.id}`)}
        >
          View
        </button>
      </li>
    ))}
  </ul>

  <h2>Workers</h2>
  <ul>
  {workers.map((worker) => (
  <li key={worker.id} style={{ marginBottom: "10px" }}>
    {worker.username}
    <button
  className="btn btn-sm btn-outline-primary"
  onClick={() => navigate(`/worker/${worker.id}`)}
>
  View
</button>

  </li>
))}

</ul>


  {selectedClient && (
    <div className="mt-4 p-3 border rounded shadow-sm bg-white">
      <h4>Client Details</h4>
      <p><strong>ID:</strong> {selectedClient.id}</p>
      <p><strong>Username:</strong> {selectedClient.username}</p>
      <p><strong>Email:</strong> {selectedClient.email}</p>
      <p><strong>First Name:</strong> {selectedClient.first_name || "-"}</p>
      <p><strong>Last Name:</strong> {selectedClient.last_name || "-"}</p>
    </div>
  )}

{selectedWorker && (
  <div className="mt-4 p-3 border rounded shadow-sm bg-white">
    <h4>Worker Details</h4>
    <p><strong>ID:</strong> {selectedWorker.id}</p>
    <p><strong>Username:</strong> {selectedWorker.username}</p>
    <p><strong>Email:</strong> {selectedWorker.email}</p>
    <p><strong>First Name:</strong> {selectedWorker.first_name || "-"}</p>
    <p><strong>Last Name:</strong> {selectedWorker.last_name || "-"}</p>
    <p><strong>Specialty:</strong> {selectedWorker.specialty || "-"}</p>
  </div>
)}

</div>


      
    </div>
  );
};

const services = [
   { key: "assembly", title: "Assembly", icon: <BsTools />, img: assemblyImg, desc: "Assemble or disassemble furniture items with care." },
  { key: "moving", title: "Moving", icon: <BsTruck />, img: movingImg, desc: "Help with packing, moving heavy items, and safe transport." },
  { key: "cleaning", title: "Cleaning", icon: <BsBrush />, img: cleaningImg, desc: "Deep home cleaning, regular housekeeping, and office cleanup." },
  { key: "repairs", title: "Home Repairs", icon: <BsHammer />, img:repairsImg, desc: "Fix leaks, furniture, small electrical jobs, and more." },
  { key: "painting", title: "Painting", icon: <BsPaintBucket />, img: paintingImg, desc: "Interior & exterior painting with premium quality." }
];

const projects = [
  { title: "تركيب دولاب", img: assemblyImg, price: "150 ج.م" },  
  { title: "تنظيف شقة", img:cleaningImg, price: "250 ج.م" },
  { title: "دهان غرفة", img:paintingImg, price: "400 ج.م" },
  { title: "نقل أثاث", img: movingImg, price: "600 ج.م" },];

const Testimonial = ({ name, quote }) => (
  <div className="testimonial h-100 text-center">
    <div className="mb-2">
      {[...Array(5)].map((_, i) => <BsStarFill key={i} className="text-warning" />)}
    </div>
    <p className="text-muted">“{quote}”</p>
    <div className="mt-2 fw-bold">{name}</div>
  </div>
);

export default Home;


