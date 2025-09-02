import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function FormModal({ isOpen, onClose, onSave, initialData }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    if (initialData) {
      setFormData({ name: initialData.name });
    } else {
      setFormData({ name: "" });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? t("editItem") : t("addItem")}
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            {t("name")}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-1"
              required
            />
          </label>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
