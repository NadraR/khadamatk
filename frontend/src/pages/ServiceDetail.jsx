// src/pages/ServiceDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getService } from "../api/services";
import { listServiceReviews } from "../api/reviews";
import { listServiceRatings } from "../api/ratings";
import ReviewForm from "../components/ReviewForm";
import StarRating from "../components/StarRating";
import FavoriteButton from "../components/FavoriteButton";
import { createOrder } from "../api/orders";
import "./Services.css";

export default function ServiceDetail() {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [s, rvs, rts] = await Promise.all([
        getService(id),
        listServiceReviews(id),
        listServiceRatings(id),
      ]);
      setService(s.data);
      setReviews(rvs.data);
      setRatings(rts.data); // [{rating: 4, comment:..., ...}] أو حسب API بتاعك
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const avg = useMemo(() => {
    if (!ratings?.length) return 0;
    const total = ratings.reduce((sum, r) => sum + Number(r.rating || 0), 0);
    return (total / ratings.length).toFixed(1);
  }, [ratings]);

  if (loading) return <div className="services-page"><p>Loading...</p></div>;
  if (!service) return <div className="services-page"><p>Service not found</p></div>;

  return (
    <div className="services-page">
      <h1 className="title">{service.title}</h1>
      <div className="service-hero">
        <div className="hero-left">
          <p className="desc">{service.description}</p>
          {service.price != null && <div className="price">EGP {service.price}</div>}
        </div>
        <div className="hero-right">
          <div className="avg-rating">
            <div>Average Rating</div>
            <div className="avg">
              <StarRating value={Number(avg)} readOnly />
              <span style={{ marginLeft: 8 }}>{avg} / 5</span>
            </div>
            <div className="sub">{ratings.length} ratings</div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="subtitle">Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="reviews">
            {reviews.map((rv) => (
              <li key={rv.id} className="review-item">
                <StarRating value={rv.rating} readOnly />
                <div className="comment">{rv.comment}</div>
                {/* لو API بيرجع اسم المستخدم/التاريخ ضيفهم هنا */}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 className="subtitle">Add your review</h3>
        <ReviewForm serviceId={id} onCreated={refresh} />
      </section>

<section style={{ marginTop: 24 }}>
  <h3 className="subtitle">Book this service</h3>
  <BookingForm serviceId={id} onBooked={refresh} />
</section>

    </div>
  );
}


function BookingForm({ serviceId, onBooked }) {
  const [description, setDescription] = useState("");
  const [offeredPrice, setOfferedPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createOrder({ service: serviceId, description, offered_price: offeredPrice });
      setDescription(""); setOfferedPrice("");
      onBooked && onBooked();
      alert("Booking request sent!");
    } catch (e) {
      alert("Failed to book. Please login and try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={submit} className="card" style={{ padding: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 12 }}>
        <textarea placeholder="Describe your request..." value={description} onChange={e=>setDescription(e.target.value)} required />
        <input type="number" step="0.01" placeholder="Your offer" value={offeredPrice} onChange={e=>setOfferedPrice(e.target.value)} />
      </div>
      <button className="btn btn-primary" disabled={loading} style={{ marginTop: 12 }}>
        {loading ? "Sending..." : "Send Booking Request"}
      </button>
    </form>
  );
}
