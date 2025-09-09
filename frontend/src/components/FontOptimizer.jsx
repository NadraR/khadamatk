import { useEffect } from 'react';
import { initFontLoading } from '../utils/fontLoader';

const FontOptimizer = () => {
  useEffect(() => {
    // Initialize optimized font loading
    initFontLoading().catch(() => {
      // Fallback: ensure fonts are marked as loaded even if loading fails
      document.documentElement.classList.add('fonts-loaded');
    });
  }, []);

  return null;
};

export default FontOptimizer;
