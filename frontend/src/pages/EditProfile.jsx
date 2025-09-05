// src/pages/EditProfile.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import apiService from "../services/ApiService";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",   // هيتم تحديثه فورًا بالبيانات القديمة
    first_name: "",
    last_name: "",
    email: "",      // هيتم تحديثه فورًا بالبيانات القديمة
    phone: "",
    bio: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiService.get("api/accounts/client/profile/");

        // ✅ نتأكد من البيانات اللي جايه من الـ API
        console.log("Profile data fetched:", data);

        setFormData({
          username: data.username || "",  // دايمًا يملأ Username
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",        // دايمًا يملأ Email
          phone: data.phone || "",
          bio: data.bio || "",
          password: "",
        });
      } catch (err) {
        console.error(err);
        setErrorMsg("فشل في تحميل بيانات البروفايل");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const dataToSend = { ...formData };
      if (!dataToSend.password) delete dataToSend.password;

      await apiService.put("api/accounts/client/profile/update/", dataToSend);
      alert("تم تحديث البروفايل بنجاح!");
      navigate(-1); // للرجوع لصفحة البروفايل بعد الحفظ
    } catch (err) {
      console.error(err);
      setErrorMsg("فشل في تحديث البروفايل");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h3 className="mb-4">Edit Profile</h3>
      {errorMsg && <p className="text-danger">{errorMsg}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label>Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-2">
          <label>First Name</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={formData.first_name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Last Name</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={formData.last_name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-2">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            className="form-control"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Bio</label>
          <textarea
            name="bio"
            className="form-control"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>
        <div className="mb-2">
          <label>Password (leave blank to keep current)</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div className="d-flex justify-content-between mt-3">
          <button type="submit" className="btn btn-primary">Save</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
