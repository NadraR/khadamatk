import React, { useEffect, useState } from "react";
import axios from "axios";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category_id: 1,
    city: "Cairo",
    is_active: true,
  });

  const baseURL = "http://127.0.0.1:8000/api/services/";

  // --- جلب الخدمات من الباك اند
  const fetchServices = async () => {
    try {
      const response = await axios.get(baseURL);
      setServices(response.data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // --- تغيير قيم الفورم
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- إضافة أو تعديل خدمة
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // كل الحقول مطابقة للـ serializer
      const dataToSend = {
        title: formData.title,
        description: formData.description || "",
        price: parseFloat(formData.price),
        // category_id: parseInt(formData.category_id),
        city: formData.city || "Cairo",
        is_active: formData.is_active,
      };

      if (editId) {
        await axios.put(`${baseURL}${editId}/`, dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await axios.post(baseURL, dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
      }

      // إعادة تعيين الفورم وجلب البيانات الجديدة
      setFormData({ title: "", description: "", price: "", city: "Cairo", is_active: true });
      setEditId(null);
      setShowForm(false);
      fetchServices();
    } catch (err) {
      console.error("Error saving service:", err.response?.data || err);
      alert("حدث خطأ أثناء حفظ الخدمة، تحقق من البيانات أو الباك اند.");
    }
  };

  // --- حذف خدمة
  const handleDelete = async (id) => {
    if (window.confirm("هل تريد حذف هذه الخدمة؟")) {
      try {
        await axios.delete(`${baseURL}${id}/`, {
          headers: { "Content-Type": "application/json" },
        });
        fetchServices();
      } catch (err) {
        console.error("Error deleting service:", err.response?.data || err);
        alert("حدث خطأ أثناء حذف الخدمة.");
      }
    }
  };

  if (loading) return <p>جاري تحميل الخدمات...</p>;

  return (
    <div dir="rtl" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>الخدمات</h1>

      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: 20 }}>
        {editId ? "تعديل خدمة" : "+ إضافة خدمة"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
          <input
            type="text"
            name="title"
            placeholder="اسم الخدمة"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="وصف الخدمة"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="number"
            name="price"
            placeholder="السعر"
            value={formData.price}
            onChange={handleChange}
            required
          />
          {/* <input
            type="number"
            name="category_id"
            placeholder="رقم الفئة"
            value={formData.category_id}
            onChange={handleChange}
            required
          /> */}
          <input
            type="text"
            name="city"
            placeholder="المدينة"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <button type="submit">{editId ? "حفظ التعديلات" : "إضافة"}</button>
        </form>
      )}

      <table border="1" cellPadding="5" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>رقم</th>
            <th>اسم الخدمة</th>
            <th>السعر</th>
            <th>فئة</th>
            <th>المدينة</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.title}</td>
              <td>{s.price} ج.م</td>
              <td>{s.category?.name || "-"}</td>
              <td>{s.city}</td>
              <td>
                <button
                  onClick={() => {
                    setFormData({
                      title: s.title,
                      description: s.description || "",
                      price: s.price,
                      // category_id: s.category?.id || 1,
                      city: s.city || "Cairo",
                      is_active: s.is_active,
                    });
                    setEditId(s.id);
                    setShowForm(true);
                  }}
                >
                  تعديل
                </button>
                <button onClick={() => handleDelete(s.id)} style={{ marginLeft: 5 }}>
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
