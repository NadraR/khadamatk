import { useEffect, useState } from 'react';

// Font loading utility hook
export const useFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const checkFonts = async () => {
      try {
        // Check if fonts are loaded
        await document.fonts.ready;
        
        // Check specific fonts
        const fontChecks = [
          'Poppins',
          'Noto Sans Arabic',
          'Cairo',
          'Inter'
        ];

        const loadedFonts = await Promise.all(
          fontChecks.map(font => document.fonts.check(`16px ${font}`))
        );

        if (loadedFonts.every(loaded => loaded)) {
          setFontsLoaded(true);
        } else {
          // Fallback: set loaded after a timeout
          setTimeout(() => setFontsLoaded(true), 2000);
        }
      } catch (error) {
        console.warn('Font loading check failed:', error);
        setFontsLoaded(true); // Fallback
      }
    };

    checkFonts();
  }, []);

  return fontsLoaded;
};

// Font utility functions
export const fontUtils = {
  // Get font family based on language
  getFontFamily: (language = 'en') => {
    const fonts = {
      en: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ar: 'Noto Sans Arabic, Cairo, Poppins, sans-serif',
      mixed: 'Poppins, Noto Sans Arabic, Cairo, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    };
    return fonts[language] || fonts.mixed;
  },

  // Get font size based on type
  getFontSize: (type) => {
    const sizes = {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    };
    return sizes[type] || sizes.base;
  },

  // Get font weight
  getFontWeight: (weight) => {
    const weights = {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    };
    return weights[weight] || weights.normal;
  },

  // Get line height
  getLineHeight: (height) => {
    const heights = {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    };
    return heights[height] || heights.normal;
  },

  // Get letter spacing
  getLetterSpacing: (spacing) => {
    const spacings = {
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    };
    return spacings[spacing] || spacings.normal;
  },

  // Generate font styles object
  getFontStyles: (options = {}) => {
    const {
      language = 'mixed',
      size = 'base',
      weight = 'normal',
      lineHeight = 'normal',
      letterSpacing = 'normal'
    } = options;

    return {
      fontFamily: fontUtils.getFontFamily(language),
      fontSize: fontUtils.getFontSize(size),
      fontWeight: fontUtils.getFontWeight(weight),
      lineHeight: fontUtils.getLineHeight(lineHeight),
      letterSpacing: fontUtils.getLetterSpacing(letterSpacing),
    };
  }
};

// CSS-in-JS font styles
export const fontStyles = {
  // Heading styles
  h1: fontUtils.getFontStyles({ size: '4xl', weight: 'semibold', lineHeight: 'tight' }),
  h2: fontUtils.getFontStyles({ size: '3xl', weight: 'semibold', lineHeight: 'tight' }),
  h3: fontUtils.getFontStyles({ size: '2xl', weight: 'semibold', lineHeight: 'tight' }),
  h4: fontUtils.getFontStyles({ size: 'xl', weight: 'semibold', lineHeight: 'tight' }),
  h5: fontUtils.getFontStyles({ size: 'lg', weight: 'semibold', lineHeight: 'tight' }),
  h6: fontUtils.getFontStyles({ size: 'base', weight: 'semibold', lineHeight: 'tight' }),

  // Body text styles
  body: fontUtils.getFontStyles({ size: 'base', weight: 'normal', lineHeight: 'normal' }),
  bodySmall: fontUtils.getFontStyles({ size: 'sm', weight: 'normal', lineHeight: 'normal' }),
  caption: fontUtils.getFontStyles({ size: 'xs', weight: 'normal', lineHeight: 'normal' }),

  // Button styles
  button: fontUtils.getFontStyles({ size: 'base', weight: 'medium', lineHeight: 'normal' }),
  buttonSmall: fontUtils.getFontStyles({ size: 'sm', weight: 'medium', lineHeight: 'normal' }),
  buttonLarge: fontUtils.getFontStyles({ size: 'lg', weight: 'medium', lineHeight: 'normal' }),

  // Arabic text styles
  arabic: fontUtils.getFontStyles({ language: 'ar', size: 'base', weight: 'normal', lineHeight: 'normal' }),
  arabicHeading: fontUtils.getFontStyles({ language: 'ar', size: '2xl', weight: 'semibold', lineHeight: 'tight' }),

  // English text styles
  english: fontUtils.getFontStyles({ language: 'en', size: 'base', weight: 'normal', lineHeight: 'normal' }),
  englishHeading: fontUtils.getFontStyles({ language: 'en', size: '2xl', weight: 'semibold', lineHeight: 'tight' }),
};

export default useFonts;



