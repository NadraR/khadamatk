import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BsEnvelope, BsTelephone, BsGeoAlt, BsStarFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

const ClientProfile = () => {
  const injected = useRef(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  const client = {
    id: 5,
    name: "Mona Hassan",
    username: "mona_h",
    joined: "Mar 2024",
    bio: "Homeowner who loves trying out new reliable services and reviewing providers.",
    email: "mona@example.com",
    phone: "+201000111222",
    address: "Alexandria, Egypt",
    stats: { orders: 12, providers: 8, reviews: 5 },
    interests: ["Cleaning", "Plumbing", "Home Painting"],
    orders: {
      completed: [
        { id: 1, provider: "Ahmed Ali", service: "Pipe Installation", date: "2025-08-15" },
        { id: 2, provider: "Sara Tech", service: "AC Maintenance", date: "2025-07-30" },
      ],
      pending: [
        { id: 3, provider: "Omar Fix", service: "Wall Painting", date: "2025-09-10" },
      ],
    },
    reviews: [
      { provider: "Ahmed Ali", text: "Great job, very professional!", rating: 5 },
      { provider: "Sara Tech", text: "Quick and reliable service.", rating: 4 },
    ],
  };

  useEffect(() => {
    if (injected.current) return;
    const css = `
      :root {
        --primary:#ff5722;
        --bg:#fff9f5;
        --muted:#6b7280;
      }
      body { background:var(--bg); font-family:'Segoe UI', sans-serif; }
      .profile-cover { background:linear-gradient(135deg, #ff5722, #facc15); height:180px; border-radius:0 0 1.5rem 1.5rem; position:relative; }
      .profile-avatar { position:absolute; bottom:-50px; left:2rem; width:100px; height:100px; border-radius:50%; background:#fff; display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:bold; color:var(--primary); box-shadow:0 4px 14px rgba(0,0,0,.1); }
      .card-custom { background:#fff; border-radius:1rem; box-shadow:0 6px 18px rgba(0,0,0,.05); padding:1.5rem; }
      .stat-box { background:#fff; border-radius:1rem; padding:1rem; text-align:center; box-shadow:0 4px 12px rgba(0,0,0,.05); }
      .review-card { background:#fff; border-radius:1rem; padding:1rem; box-shadow:0 4px 12px rgba(0,0,0,.05); }
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
        <div className="profile-avatar">{client.name[0]}</div>
      </div>

      {/* Info */}
      <div className="container mt-5">
        <h3 className="fw-bold">{client.name}</h3>
        <p className="text-muted">@{client.username}</p>
        <p>{client.bio}</p>
        <small className="text-muted">Joined {client.joined}</small>

        {/* زرار Message */}
        <div className="mt-3">
          <button
            className="btn btn-primary"
            onClick={() => navigate("/chat", { state: { user: client } })}
          >
            Message
          </button>
        </div>

        {/* Stats */}
        <div className="row text-center mt-4 g-3">
          <div className="col-4"><div className="stat-box"><h5>{client.stats.orders}</h5><p>Orders</p></div></div>
          <div className="col-4"><div className="stat-box"><h5>{client.stats.providers}</h5><p>Providers</p></div></div>
          <div className="col-4"><div className="stat-box"><h5>{client.stats.reviews}</h5><p>Reviews</p></div></div>
        </div>

        {/* Contact & Interests */}
        <div className="row g-4 mt-4">
          <div className="col-md-6">
            <div className="card-custom">
              <h5 className="fw-bold mb-3">Contact</h5>
              <p><BsEnvelope /> {client.email}</p>
              <p><BsTelephone /> {client.phone}</p>
              <p><BsGeoAlt /> {client.address}</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card-custom">
              <h5 className="fw-bold mb-3">Interests</h5>
              <p>{client.interests.join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Orders Tabs */}
        <h5 className="fw-bold mt-5">Orders</h5>
        <ul className="nav nav-tabs mt-3">
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
            [...client.orders.completed, ...client.orders.pending].map(o => (
              <div key={o.id} className="card-custom mb-3">
                <h6 className="fw-bold">{o.service}</h6>
                <p className="text-muted small">Provider: {o.provider} • {o.date}</p>
              </div>
            ))}
          {activeTab === "completed" &&
            client.orders.completed.map(o => (
              <div key={o.id} className="card-custom mb-3 border-start border-success border-4">
                <h6>{o.service}</h6>
                <p className="text-muted small">Provider: {o.provider} • {o.date}</p>
              </div>
            ))}
          {activeTab === "pending" &&
            client.orders.pending.map(o => (
              <div key={o.id} className="card-custom mb-3 border-start border-warning border-4">
                <h6>{o.service}</h6>
                <p className="text-muted small">Provider: {o.provider} • {o.date}</p>
              </div>
            ))}
        </div>

        {/* Reviews */}
        <h5 className="fw-bold mt-5">My Reviews</h5>
        <div className="row g-4">
          {client.reviews.map((r, i) => (
            <div key={i} className="col-md-6">
              <div className="review-card">
                <div className="mb-2">
                  {[...Array(r.rating)].map((_, j) => <BsStarFill key={j} className="text-warning" />)}
                </div>
                <p className="text-muted">“{r.text}”</p>
                <div className="fw-bold">For {r.provider}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ClientProfile;
