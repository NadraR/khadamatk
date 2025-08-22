import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listServices, createService, updateService, deleteService } from "../api/services";
import "./Services.css";

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", price: "" });

  const categoryId = searchParams.get("category");

  // جلب الخدمات
  const fetchServices = async () => {
    try {
      const params = categoryId ? { category: categoryId } : {};
      const response = await listServices(params);
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [categoryId]);

  // تغيير قيم الفورم
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // إضافة أو تعديل خدمة
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateService(editId, formData);
      } else {
        await createService(formData);
      }
      setFormData({ title: "", price: "" });
      setEditId(null);
      setShowForm(false);
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  // حذف خدمة
  const handleDelete = async (id) => {
    if (window.confirm("هل تريد حذف هذه الخدمة؟")) {
      try {
        await deleteService(id);
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  if (loading) return <p>جاري تحميل الخدمات...</p>;

  return (
    <div className="services-container">
      <h1 className="services-title">الخدمات</h1>

      <button className="add-service-btn" onClick={() => setShowForm(!showForm)}>
        {editId ? "تعديل خدمة" : "+ إضافة خدمة"}
      </button>

      {showForm && (
        <form className="service-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="اسم الخدمة"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="price"
            placeholder="السعر"
            value={formData.price}
            onChange={handleChange}
            required
          />
          <button type="submit">{editId ? "حفظ التعديلات" : "إضافة"}</button>
        </form>
      )}

      <table className="services-table">
        <thead>
          <tr>
            <th>رقم</th>
            <th>اسم الخدمة</th>
            <th>السعر</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.id}>
              <td>{service.id}</td>
              <td>{service.title}</td>
              <td>{service.price} ج.م</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setFormData({ title: service.title, price: service.price });
                    setEditId(service.id);
                    setShowForm(true);
                  }}
                >
                  تعديل
                </button>
                <button className="delete-btn" onClick={() => handleDelete(service.id)}>
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
