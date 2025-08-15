import React from 'react';
import './Categories.css'; // Assuming you have a CSS file for styling
import { Link } from 'react-router-dom';

const Categories = () => {
  const categories = [
    { name: 'دهان', emoji: '🎨', path: '/category/painting' },
    { name: 'نجارة', emoji: '🔨', path: '/category/carpentry' },
    { name: 'كهرباء', emoji: '⚡', path: '/category/electricity' },
    { name: 'سباكة', emoji: '🔧', path: '/category/plumbing' }
  ];

  return (
    <div className="categories">
      {categories.map((cat, index) => (
        <Link to={cat.path} key={index} className="category-card">
          <span className="emoji">{cat.emoji}</span>
          <p>{cat.name}</p>
        </Link>
      ))}
    </div>
  );
};

export default Categories;
