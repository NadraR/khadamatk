import React, { useEffect, useState } from "react";
import api from "../api";
import { ACCESS_TOKEN } from "../constants";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem(ACCESS_TOKEN);
  const baseURL = `${import.meta.env.VITE_API_URL}/orders/`;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get(baseURL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (response.data && typeof response.data === "object") {
        setOrders(Array.isArray(response.data.results) ? response.data.results : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err.response?.data || err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p className="loading-text">جاري تحميل الطلبات...</p>;

  return (
    <div className="orders-container" dir="rtl">
      <h1 className="orders-title">الطلبات</h1>

      <button className="add-order-btn">+ إضافة طلب</button>

      <table className="orders-table">
        <thead>
          <tr>
            <th>رقم</th>
            <th>الخدمة</th>
            <th>العميل</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(orders) && orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.service}</td>
              <td>{order.client}</td>
              <td>{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
