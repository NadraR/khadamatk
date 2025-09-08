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

    // Add preload for better performance
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = font.url;
    preloadLink.as = 'style';
    preloadLink.crossOrigin = 'anonymous';
    
    // Add the actual stylesheet link
    const link = document.createElement('link');
    link.href = font.url;
    link.rel = 'stylesheet';
    link.crossOrigin = 'anonymous';
    
    // Add preload first, then stylesheet after a short delay to ensure preload is used
    document.head.appendChild(preloadLink);
    
    // Use the preload by adding the stylesheet after it's been preloaded
    preloadLink.addEventListener('load', () => {
      document.head.appendChild(link);
    });
    
    // Fallback: if preload doesn't fire, add stylesheet after 100ms
    setTimeout(() => {
      if (!document.querySelector(`link[href="${font.url}"][rel="stylesheet"]`)) {
        document.head.appendChild(link);
      }
    }, 100);
  });
};

// Load fonts immediately
if (typeof window !== 'undefined') {
  loadGoogleFonts();
}



