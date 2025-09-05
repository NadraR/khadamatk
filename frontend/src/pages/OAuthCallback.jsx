// src/pages/OAuthCallback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    // اختيار backend URL حسب البيئة
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    if (code) {
      fetch(`${BACKEND_URL}/api/google-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Login successful", data);
          navigate("/dashboard");
        })
        .catch((err) => {
          console.error("Login failed", err);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <div>Logging in...</div>;
};

export default OAuthCallback;
