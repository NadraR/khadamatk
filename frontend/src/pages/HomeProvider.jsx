import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsEnvelope, BsTelephone, BsGeoAlt, BsStarFill } from "react-icons/bs";

const ProviderProfile = () => {
  const injected = useRef(false);
  const [activeTab, setActiveTab] = useState("orders");

  const provider = {
    name: "Ahmed Ali",
    username: "ahmed_services",
    joined: "Jan 2023",
    bio: "Professional plumber with 10+ years of experience. I provide reliable home maintenance services.",
    email: "ahmed@example.com",
    phone: "+20123456789",
    address: "Cairo, Egypt",
    stats: { services: 25, clients: 120, reviews: 80, rating: 4.7 },
    skills: ["Plumbing", "Electricity", "Home Maintenance"],
    certifications: ["Certified Plumber", "ISO Safety Training"],
    servicesList: [
      { title: "Pipe Installation", desc: "High quality pipe installation for homes." },
      { title: "Leak Fixing", desc: "Fast and reliable leak fixing service." },
      { title: "Water Heater Setup", desc: "Safe installation of heaters." },
    ],
    orders: {
      completed: [
        { id: 1, client: "Mohamed", service: "Pipe Installation", date: "2025-08-20" },
        { id: 2, client: "Sara", service: "Leak Fixing", date: "2025-08-18" },
      ],
      pending: [
        { id: 3, client: "Omar", service: "Water Heater Setup", date: "2025-09-05" },
      ],
    },
    testimonials: [
      { name: "Sara", quote: "خدمة ممتازة وسريعة جدًا." },
      { name: "Mohamed", quote: "الفني محترف وأسعاره مناسبة." },
      { name: "Omar", quote: "أفضل فني جربته في السباكة." },
    ],
  };

  useEffect(() => {
    if (injected.current) return;
    const css = `
      :root {
        --primary:#0077ff;
        --bg:#f9fbff;
        --muted:#6b7280;
      }
      body { background:var(--bg); font-family:'Segoe UI', sans-serif; }
      .profile-cover { background:linear-gradient(135deg, #0077ff, #22c55e); height:180px; border-radius:0 0 1.5rem 1.5rem; position:relative; }
      .profile-avatar { position:absolute; bottom:-50px; left:2rem; width:100px; height:100px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; color:var(--primary); box-shadow:0 4px 14px rgba(0,0,0,.1); }
      .card-custom { background:#fff; border-radius:1rem; box-shadow:0 6px 18px rgba(0,0,0,.05); padding:1.5rem; }
      .stat-box { background:#fff; border-radius:1rem; padding:1rem; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,.05); }
      .testimonial { background:#fff; border-radius:1rem; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,.05); text-align:center; transition:.3s; }
      .testimonial:hover { transform:translateY(-5px); }
    `;
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    injected.current = true;
  }, []);

  return (
    <div className="pb-5">
      {/* Cover */}
      <div className="profile-cover">
        <div className="profile-avatar">{provider.name[0]}</div>
      </div>

      {/* Info */}
      <div className="container mt-5">
        <h3 className="fw-bold">{provider.name}</h3>
        <p className="text-muted">@{provider.username}</p>
        <p>{provider.bio}</p>
        <small className="text-muted">Joined {provider.joined}</small>

        {/* Stats */}
        <div className="row text-center mt-4 g-3">
          <div className="col-6 col-md-3"><div className="stat-box"><h5>{provider.stats.services}</h5><p>Services</p></div></div>
          <div className="col-6 col-md-3"><div className="stat-box"><h5>{provider.stats.clients}</h5><p>Clients</p></div></div>
          <div className="col-6 col-md-3"><div className="stat-box"><h5>{provider.stats.reviews}</h5><p>Reviews</p></div></div>
          <div className="col-6 col-md-3"><div className="stat-box"><h5>⭐ {provider.stats.rating}</h5><p>Rating</p></div></div>
        </div>

        {/* Contact & About */}
        <div className="row g-4 mt-4">
          <div className="col-md-6">
            <div className="card-custom">
              <h5 className="fw-bold mb-3">Contact</h5>
              <p><BsEnvelope /> {provider.email}</p>
              <p><BsTelephone /> {provider.phone}</p>
              <p><BsGeoAlt /> {provider.address}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card-custom">
              <h5 className="fw-bold mb-3">About</h5>
              <p><b>Skills:</b> {provider.skills.join(", ")}</p>
              <p><b>Certifications:</b> {provider.certifications.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Services */}
        <h5 className="fw-bold mt-5">Services</h5>
        <div className="row g-4">
          {provider.servicesList.map((s, i) => (
            <div key={i} className="col-md-4">
              <div className="card-custom h-100">
                <h6 className="fw-bold">{s.title}</h6>
                <p className="text-muted small">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Tabs */}
        <ul className="nav nav-tabs mt-5">
          {["orders", "completed", "pending"].map(tab => (
            <li className="nav-item" key={tab}>
              <button
                className={`nav-link ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "orders" ? "All Orders" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3">
          {activeTab === "orders" &&
            [...provider.orders.completed, ...provider.orders.pending].map(o => (
              <div key={o.id} className="card-custom mb-3">
                <h6 className="fw-bold">{o.service}</h6>
                <p className="text-muted small">Client: {o.client} • {o.date}</p>
              </div>
            ))}
          {activeTab === "completed" &&
            provider.orders.completed.map(o => (
              <div key={o.id} className="card-custom mb-3 border-start border-success border-4">
                <h6>{o.service}</h6>
                <p className="text-muted small">Client: {o.client} • {o.date}</p>
              </div>
            ))}
          {activeTab === "pending" &&
            provider.orders.pending.map(o => (
              <div key={o.id} className="card-custom mb-3 border-start border-warning border-4">
                <h6>{o.service}</h6>
                <p className="text-muted small">Client: {o.client} • {o.date}</p>
              </div>
            ))}
        </div>

        {/* Testimonials */}
        <h5 className="fw-bold mt-5">Client Reviews</h5>
        <div className="row g-4">
          {provider.testimonials.map((t, i) => (
            <div key={i} className="col-md-4">
              <div className="testimonial">
                <div className="mb-2">
                  {[...Array(5)].map((_, j) => <BsStarFill key={j} className="text-warning" />)}
                </div>
                <p className="text-muted">“{t.quote}”</p>
                <div className="fw-bold">{t.name}</div>
              </div>
            </div>
          ))}
        </div>

        
      </div>
    </div>
  );
};

export default ProviderProfile;
