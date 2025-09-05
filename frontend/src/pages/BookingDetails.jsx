import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/ApiService";

function BookingDetails() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await api.get(`/api/bookings/${id}/`);
        setBooking(response); // ✅ بدون .data
      } catch (err) {
        setError("فشل تحميل تفاصيل الحجز.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  const handleDownloadInvoice = async () => {
    if (!booking?.invoice_id) return;
    try {
      const response = await api.get(`/api/invoices/${booking.invoice_id}/download/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${booking.invoice_id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch {
      alert("فشل تحميل الفاتورة PDF.");
    }
  };

  if (loading) return <div className="text-center my-5">جارٍ التحميل...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!booking) return null;

  return (
    <div className="container mt-4">
      <h2>📌 تفاصيل الحجز #{booking.id}</h2>
      <div className="card mt-3">
        <div className="card-body">
          <p><strong>الخدمة:</strong> {booking.service_title}</p>
          <p><strong>العميل:</strong> {booking.client_name}</p>
          <p><strong>المقدم:</strong> {booking.provider_name}</p>
          <p><strong>التاريخ:</strong> {new Date(booking.date).toLocaleDateString()}</p>
          <p>
            <strong>الحالة:</strong>{" "}
            <span className={`badge ${booking.status === "confirmed" ? "bg-success" : "bg-secondary"}`}>
              {booking.status}
            </span>
          </p>

          {booking.invoice_id && (
            <button
              className="btn btn-outline-primary mt-3"
              onClick={handleDownloadInvoice}
            >
              تحميل الفاتورة PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;
