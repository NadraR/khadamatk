import React, { useState, useEffect } from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const FontLoader = ({ children, fallback = null }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // List of fonts to load
        const fonts = [
          'Poppins',
          'Noto Sans Arabic',
          'Cairo',
          'Inter'
        ];

        let loadedCount = 0;
        const totalFonts = fonts.length;

        // Check each font
        for (const font of fonts) {
          try {
            // Try to load the font
            await document.fonts.load(`16px ${font}`);
            loadedCount++;
            setLoadingProgress((loadedCount / totalFonts) * 100);
          } catch (error) {
            console.warn(`Failed to load font ${font}:`, error);
            loadedCount++;
            setLoadingProgress((loadedCount / totalFonts) * 100);
          }
        }

        // Wait for all fonts to be ready
        await document.fonts.ready;
        
        // Additional check to ensure fonts are actually loaded
        const fontChecks = await Promise.all(
          fonts.map(font => document.fonts.check(`16px ${font}`))
        );

        if (fontChecks.every(loaded => loaded)) {
          setFontsLoaded(true);
        } else {
          // Fallback: proceed after timeout even if fonts aren't fully loaded
          setTimeout(() => setFontsLoaded(true), 1000);
        }
      } catch (error) {
        console.warn('Font loading failed:', error);
        // Fallback: proceed anyway
        setTimeout(() => setFontsLoaded(true), 1000);
      }
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    if (fallback) {
      return fallback;
    }

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: 'white',
            marginBottom: 2,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
            marginBottom: 1,
          }}
        >
          Loading Fonts...
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            opacity: 0.8,
          }}
        >
          {Math.round(loadingProgress)}% Complete
        </Typography>
      </Box>
    );
  }

  return children;
};

export default FontLoader;
