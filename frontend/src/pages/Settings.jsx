import React, { useState } from "react";
import './Settings.css';

const Settings = () => {
  const [username, setUsername] = useState("المستخدم");
  const [email, setEmail] = useState("example@email.com");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("تم حفظ التغييرات بنجاح!");
  };

  return (
    <div className="settings-container">
      <h1 className="settings-title">الإعدادات</h1>
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>اسم المستخدم:</label>
          <input
            type="text"
            value={username}
            placeholder="أدخل اسم المستخدم"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>البريد الإلكتروني:</label>
          <input
            type="email"
            value={email}
            placeholder="example@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit">حفظ التغييرات</button>
      </form>
    </div>
  );
};

export default Settings;
