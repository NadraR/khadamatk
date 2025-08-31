import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { service } = location.state || {};
  const token = localStorage.getItem(ACCESS_TOKEN);

  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    address: "",
    date: "",
    service_id: service?.id || null,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("USER_DATA");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setFormData((prev) => ({
        ...prev,
        customer_name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`${import.meta.env.VITE_API_URL}/orders/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("تم تأكيد الطلب بنجاح ✅");
      navigate("/"); 
    } catch (err) {
      console.error("Error creating order:", err.response?.data || err);
      alert("حصل خطأ أثناء تأكيد الطلب");
    }
  };

  if (!service) return <p>❌ لا توجد خدمة مختارة.</p>;

  return (
    <div className="container my-5" dir="rtl">
      <h2 className="mb-4 text-primary">تأكيد حجز الخدمة</h2>

      <div className="card p-3 mb-4">
        <h4>{service.title}</h4>
        <p className="text-muted">السعر: {service.price} </p>
      </div>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">الاسم</label>
          <input
            type="text"
            name="customer_name"
            className="form-control"
            value={formData.customer_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">رقم الهاتف</label>
          <input
            type="tel"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <label className="form-label">العنوان</label>
          <input
            type="text"
            name="address"
            className="form-control"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">ميعاد الخدمة</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary btn-lg">
            تأكيد الطلب
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderPage;
