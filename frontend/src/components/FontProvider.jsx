import React, { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Create a Material-UI theme with custom fonts
const theme = createTheme({
  typography: {
    fontFamily: [
      'Poppins',
      'Noto Sans Arabic',
      'Cairo',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    h6: {
      fontFamily: 'Poppins, Inter, sans-serif',
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.2,
      letterSpacing: '-0.025em',
    },
    body1: {
      fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
          fontWeight: 500,
          textTransform: 'none',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
          fontWeight: 500,
        },
      },
    },
  },
});

const FontProvider = ({ children }) => {
  useEffect(() => {
    // Ensure fonts are loaded
    if (typeof window !== 'undefined') {
      // Preload critical fonts
      const fontPreloads = [
        'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap',
        'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700;800&display=swap',
        'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap',
      ];

      fontPreloads.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'style';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      // Add font-display: swap for better performance
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Poppins';
          font-display: swap;
        }
        @font-face {
          font-family: 'Noto Sans Arabic';
          font-display: swap;
        }
        @font-face {
          font-family: 'Cairo';
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default FontProvider;



