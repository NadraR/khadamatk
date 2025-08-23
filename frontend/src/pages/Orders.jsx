import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/orders/")
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>جاري تحميل الطلبات...</p>;

  return (
    <div className="orders-container">
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
          {orders.map((order) => (
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
