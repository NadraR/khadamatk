// Font loading utility for better performance
export const loadFonts = () => {
  // Check if fonts are already loaded
  if (document.documentElement.classList.contains('fonts-loaded')) {
    return Promise.resolve();
  }

  // Create a promise that resolves when fonts are loaded
  return new Promise((resolve) => {
    if ('fonts' in document) {
      const fontPromises = [
        // Load only essential font weights
        document.fonts.load('400 16px Poppins'),
        document.fonts.load('500 16px Poppins'),
        document.fonts.load('600 16px Poppins'),
        document.fonts.load('700 16px Poppins'),
        document.fonts.load('400 16px "Noto Sans Arabic"'),
        document.fonts.load('500 16px "Noto Sans Arabic"'),
        document.fonts.load('600 16px "Noto Sans Arabic"'),
        document.fonts.load('700 16px "Noto Sans Arabic"'),
        document.fonts.load('400 16px Cairo'),
        document.fonts.load('500 16px Cairo'),
        document.fonts.load('600 16px Cairo'),
        document.fonts.load('700 16px Cairo'),
      ];

      Promise.all(fontPromises)
        .then(() => {
          document.documentElement.classList.add('fonts-loaded');
          resolve();
        })
        .catch(() => {
          // Fallback: add class anyway after timeout
          document.documentElement.classList.add('fonts-loaded');
          resolve();
        });
    } else {
      // Fallback for browsers without Font Loading API
      setTimeout(() => {
        document.documentElement.classList.add('fonts-loaded');
        resolve();
      }, 1000);
    }
  });
};

// Preload critical fonts
export const preloadFonts = () => {
  // Use the correct Google Fonts CSS URL instead of individual font files
  const fontCssUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap';
  
  // Preload the CSS file
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = fontCssUrl;
  link.as = 'style';
  link.onload = function() {
    this.onload = null;
    this.rel = 'stylesheet';
  };
  document.head.appendChild(link);
  
  // Fallback for browsers that don't support onload
  const noscript = document.createElement('noscript');
  const fallbackLink = document.createElement('link');
  fallbackLink.rel = 'stylesheet';
  fallbackLink.href = fontCssUrl;
  noscript.appendChild(fallbackLink);
  document.head.appendChild(noscript);
};

// Initialize font loading
export const initFontLoading = () => {
  preloadFonts();
  return loadFonts();
};
// Global Google Fonts loader for Arabic and English support
export const loadGoogleFonts = () => {
  if (typeof window === 'undefined') return;

  const fonts = [
    {
      name: 'Poppins',
      weights: '300;400;500;600;700;800',
      url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap'
    },
    {
      name: 'Noto Sans Arabic',
      weights: '300;400;500;600;700;800',
      url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap'
    },
    {
      name: 'Cairo',
      weights: '300;400;500;600;700;800',
      url: 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap'
    },
    {
      name: 'Inter',
      weights: '300;400;500;600;700;800',
      url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
    }
  ];

  fonts.forEach(font => {
    // Check if font is already loaded
    const existingLink = document.querySelector(`link[href*="${font.name}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.href = font.url;
    link.rel = 'stylesheet';
    link.crossOrigin = 'anonymous';
    
    // Add preload for better performance
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = font.url;
    preloadLink.as = 'style';
    preloadLink.crossOrigin = 'anonymous';
    
    document.head.appendChild(preloadLink);
    document.head.appendChild(link);
  });
};

// Load fonts immediately
if (typeof window !== 'undefined') {
  loadGoogleFonts();
}



