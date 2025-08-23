import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./Settings.css";

const Settings = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState(t("defaultUser"));
  const [email, setEmail] = useState("example@email.com");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t("changesSaved"));
  };

  return (
    <div className="settings-container" dir="rtl">
      <h1 className="settings-title">{t("settings")}</h1>
      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>{t("username")}:</label>
          <input
            type="text"
            value={username}
            placeholder={t("enterUsername")}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>{t("email")}:</label>
          <input
            type="email"
            value={email}
            placeholder="example@email.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button type="submit">{t("saveChanges")}</button>
      </form>
    </div>
  );
};

export default Settings;
