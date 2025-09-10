import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const ThemeContext = createContext();

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};

export const CustomThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // تحقق من localStorage أولاً
    const saved = localStorage.getItem('admin_theme_mode');
    if (saved) {
      return saved === 'dark';
    }
    // إذا لم يكن هناك إعداد محفوظ، استخدم النظام الافتراضي
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // حفظ الإعداد في localStorage
  useEffect(() => {
    localStorage.setItem('admin_theme_mode', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#0077ff',
        light: '#4dabf7',
        dark: '#0056b3',
      },
      secondary: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
      },
      background: {
        default: isDarkMode ? '#0f172a' : '#f8fafc',
        paper: isDarkMode ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#f1f5f9' : '#1e293b',
        secondary: isDarkMode ? '#94a3b8' : '#64748b',
      },
      // ألوان مخصصة للدارك مود - أكثر غموقاً
      ...(isDarkMode && {
        background: {
          default: '#0a0f1a',
          paper: '#111827',
        },
        text: {
          primary: '#e5e7eb',
          secondary: '#9ca3af',
        },
        divider: '#1f2937',
      }),
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            color: isDarkMode ? '#e5e7eb' : '#1e293b',
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.4)' 
              : '0 4px 20px rgba(0,123,255,0.3)',
            borderBottom: isDarkMode 
              ? '1px solid #1f2937' 
              : '1px solid rgba(0,123,255,0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            border: isDarkMode ? '1px solid #1f2937' : '1px solid rgba(0,123,255,0.1)',
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,123,255,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
            fontWeight: 500,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,123,255,0.1)',
            },
          },
        },
      },
    },
    typography: {
      fontFamily: '"Poppins", "Cairo", "Noto Sans Arabic", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
  });

  const value = {
    isDarkMode,
    toggleTheme,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
