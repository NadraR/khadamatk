// src/components/ReviewForm.jsx
import { useState } from "react";
import StarRating from "./StarRating";
import { createReview } from "../api/reviews";

export default function ReviewForm({ serviceId, onCreated }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await createReview(serviceId, { rating, comment });
      setComment("");
      setRating(5);
      onCreated?.();
    } catch (e) {
      setErr("حصل خطأ أثناء إضافة الريفيو");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="review-form">
      <label className="label">Your rating</label>
      <StarRating value={rating} onChange={setRating} />
      <label className="label">Comment</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="اكتب رأيك باختصار"
      />
      {err && <p className="error">{err}</p>}
      <button disabled={loading} type="submit">
        {loading ? "Saving..." : "Add Review"}
      </button>
    </form>
  );
}
