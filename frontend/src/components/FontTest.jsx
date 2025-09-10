import React from 'react';
import { useFonts, fontStyles, fontUtils } from '../hooks/useFonts';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';

const FontTest = () => {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return <div>Loading fonts...</div>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h3" sx={{ mb: 3, textAlign: 'center' }}>
        Global Font System Test
      </Typography>

      {/* Font Family Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Font Families
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" className="font-english">
              English Text (Poppins)
            </Typography>
            <Typography className="font-english">
              This is sample English text using the Poppins font family.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" className="font-arabic" dir="rtl">
              النص العربي (Noto Sans Arabic)
            </Typography>
            <Typography className="font-arabic" dir="rtl">
              هذا نص عربي تجريبي باستخدام خط Noto Sans Arabic.
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" className="font-primary">
              Mixed Text (Primary Font)
            </Typography>
            <Typography className="font-primary">
              This is mixed text that can handle both English and Arabic: Hello مرحبا
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Font Weight Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Font Weights
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography className="font-light">Light (300) - Sample text</Typography>
            <Typography className="font-normal">Normal (400) - Sample text</Typography>
            <Typography className="font-medium">Medium (500) - Sample text</Typography>
            <Typography className="font-semibold">Semibold (600) - Sample text</Typography>
            <Typography className="font-bold">Bold (700) - Sample text</Typography>
            <Typography className="font-extrabold">Extrabold (800) - Sample text</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Font Size Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Font Sizes
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography className="text-xs">Extra Small (12px) - Sample text</Typography>
            <Typography className="text-sm">Small (14px) - Sample text</Typography>
            <Typography className="text-base">Base (16px) - Sample text</Typography>
            <Typography className="text-lg">Large (18px) - Sample text</Typography>
            <Typography className="text-xl">Extra Large (20px) - Sample text</Typography>
            <Typography className="text-2xl">2X Large (24px) - Sample text</Typography>
            <Typography className="text-3xl">3X Large (30px) - Sample text</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Font Style Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Font Styles (CSS-in-JS)
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography style={fontStyles.h1}>Heading 1 Style</Typography>
            <Typography style={fontStyles.h2}>Heading 2 Style</Typography>
            <Typography style={fontStyles.body}>Body Text Style</Typography>
            <Typography style={fontStyles.caption}>Caption Style</Typography>
            <Button style={fontStyles.button}>Button Style</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Utility Function Tests */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Utility Functions
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography style={fontUtils.getFontStyles({ language: 'en', size: 'lg', weight: 'semibold' })}>
              English Large Semibold
            </Typography>
            <Typography style={fontUtils.getFontStyles({ language: 'ar', size: 'xl', weight: 'bold' })} dir="rtl">
              عربي كبير عريض
            </Typography>
            <Typography style={fontUtils.getFontStyles({ size: 'sm', weight: 'light', lineHeight: 'relaxed' })}>
              Small Light with Relaxed Line Height
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Material-UI Integration Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Material-UI Integration
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4">Material-UI Typography H4</Typography>
            <Typography variant="body1">Material-UI Typography Body1</Typography>
            <Typography variant="caption">Material-UI Typography Caption</Typography>
            <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>
              Material-UI Button
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Bootstrap Integration Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Bootstrap Integration
          </Typography>
          
          <div className="d-flex flex-column gap-2">
            <h4 className="font-primary">Bootstrap H4 with Global Font</h4>
            <p className="font-primary">Bootstrap paragraph with global font</p>
            <button className="btn btn-primary">Bootstrap Button</button>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FontTest;



