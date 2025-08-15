import React from "react";
import './Clients.css';

const Clients = () => {
  const clients = [
    { id: 1, name: "أحمد محمد", phone: "01000000000" },
    { id: 2, name: "منى علي", phone: "01111111111" },
    { id: 3, name: "سعيد حسن", phone: "01222222222" },
  ];

  return (
    <div className="clients-container">
      <h1 className="clients-title">العملاء</h1>

      <ul className="clients-list">
        {clients.map(client => (
          <li key={client.id} className="clients-item">
            <strong>{client.name}</strong>
            <span>{client.phone}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Clients;
