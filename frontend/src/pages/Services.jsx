import React, { useEffect, useState } from "react";
import { ApiService } from "../services/ApiService";
import "./Services.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    city: "Cairo",
    is_active: true,
    category_id: "",
  });

  const apiService = new ApiService();
  const baseURL = `${import.meta.env.VITE_API_URL}/services/`;

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/services/`);

      if (Array.isArray(response.data)) {
        setServices(response.data);
      } else if (response.data && typeof response.data === "object") {
        setServices(Array.isArray(response.data.results) ? response.data.results : []);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Error fetching services:", err.response?.data || err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description || "",
        price: parseFloat(formData.price),
        city: formData.city || "Cairo",
        is_active: formData.is_active,
        category_id: formData.category_id,
      };

      if (editId) {
        await apiService.put(`/services/${editId}/`, dataToSend);
      } else {
        await apiService.post(`/services/`, dataToSend);
      }

      setFormData({ title: "", description: "", price: "", city: "Cairo", is_active: true, category_id: "" });
      setEditId(null);
      setShowForm(false);
      fetchServices();
    } catch (err) {
      console.error("Error saving service:", err.response?.data || err);
      alert("حدث خطأ أثناء حفظ الخدمة، تحقق من البيانات أو الباك اند.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("هل تريد حذف هذه الخدمة؟")) {
      try {
        await apiService.delete(`/services/${id}/`);
        fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err.response?.data || err);
        alert("حدث خطأ أثناء حذف الخدمة.");
      }
    }
  };

  if (loading) return <p className="loading-text">جاري تحميل الخدمات...</p>;

  return (
    <div className="services-container" dir="rtl">
      <h1 className="services-header">الخدمات</h1>

      <button onClick={() => setShowForm(!showForm)} className="toggle-form-btn">
        {editId ? "تعديل خدمة" : "+ إضافة خدمة"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="service-form">
          <input type="text" name="title" placeholder="اسم الخدمة" value={formData.title} onChange={handleChange} required className="form-input" />
          <input type="text" name="description" placeholder="وصف الخدمة" value={formData.description} onChange={handleChange} className="form-input" />
          <input type="number" name="price" placeholder="السعر" value={formData.price} onChange={handleChange} required className="form-input" />
          <select name="category_id" value={formData.category_id} onChange={handleChange} required className="form-select">
            <option value="">اختر التصنيف</option>
            <option value="1">كهرباء</option>
            <option value="2">سباكة</option>
            <option value="3">نجارة</option>
          </select>
          <input type="text" name="city" placeholder="المدينة" value={formData.city} onChange={handleChange} required className="form-input" />
          <label className="form-checkbox">
            نشطة:
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
          </label>
          <button type="submit" className="submit-btn">{editId ? "حفظ التعديلات" : "إضافة"}</button>
        </form>
      )}

      <table className="services-table">
        <thead>
          <tr>
            <th>رقم</th>
            <th>اسم الخدمة</th>
            <th>السعر</th>
            <th>المدينة</th>
            <th>نشطة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(services) && services.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.title}</td>
              <td>{s.price} ج.م</td>
              <td>{s.city}</td>
              <td>{s.is_active ? "نعم" : "لا"}</td>
              <td>
                <button onClick={() => {
                  setFormData({
                    title: s.title,
                    description: s.description || "",
                    price: s.price,
                    city: s.city || "Cairo",
                    is_active: s.is_active,
                    category_id: s.category_id || "",
                  });
                  setEditId(s.id);
                  setShowForm(true);
                }} className="action-btn edit-btn">
                  تعديل
                </button>
                <button onClick={() => handleDelete(s.id)} className="action-btn delete-btn">
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Services;
