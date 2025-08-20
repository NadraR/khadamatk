import React from 'react';
import './Categories.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Categories = () => {
  const { t } = useTranslation();

  const categories = [
    { name: t('painting'), emoji: '🎨', path: '/category/painting' },
    { name: t('carpentry'), emoji: '🔨', path: '/category/carpentry' },
    { name: t('electricity'), emoji: '⚡', path: '/category/electricity' },
    { name: t('plumbing'), emoji: '🔧', path: '/category/plumbing' }
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
