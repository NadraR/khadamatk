import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Categories.css";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/services/categories/")
      .then((res) => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>جاري تحميل التصنيفات...</p>;

  return (
    <div className="categories">
      {categories.map((cat) => (
       <Link 
  to={`/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`} 
  key={cat.id} 
  className="category-card"
>
  <span className="emoji">📌</span>
  <p>{cat.name}</p>
</Link>
      ))}
    </div>
  );
};

export default Categories;
