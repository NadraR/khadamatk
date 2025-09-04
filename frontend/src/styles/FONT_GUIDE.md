# Global Font System Guide

This guide explains how to use the global font system implemented across all pages in the Khadamatk application.

## Overview

The application uses a comprehensive font system that supports both Arabic and English text with proper fallbacks and optimizations.

## Font Families

### Primary Fonts
- **Poppins**: Primary font for English text and UI elements
- **Noto Sans Arabic**: Primary font for Arabic text
- **Cairo**: Secondary Arabic font with good readability
- **Inter**: Secondary English font for better text rendering

### Font Stack
```css
font-family: 'Poppins', 'Noto Sans Arabic', 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

## CSS Variables

### Font Families
```css
--font-primary: 'Poppins', 'Noto Sans Arabic', 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-arabic: 'Noto Sans Arabic', 'Cairo', 'Poppins', sans-serif;
--font-english: 'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### Font Weights
```css
--font-weight-light: 300;
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

### Font Sizes
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
```

## Usage Examples

### CSS Classes
```html
<!-- Font families -->
<div class="font-primary">Primary font</div>
<div class="font-arabic">Arabic text</div>
<div class="font-english">English text</div>

<!-- Font weights -->
<div class="font-light">Light text</div>
<div class="font-normal">Normal text</div>
<div class="font-medium">Medium text</div>
<div class="font-semibold">Semibold text</div>
<div class="font-bold">Bold text</div>

<!-- Font sizes -->
<div class="text-xs">Extra small text</div>
<div class="text-sm">Small text</div>
<div class="text-base">Base text</div>
<div class="text-lg">Large text</div>
<div class="text-xl">Extra large text</div>

<!-- Text alignment -->
<div class="text-left">Left aligned</div>
<div class="text-center">Center aligned</div>
<div class="text-right">Right aligned</div>

<!-- Line heights -->
<div class="leading-tight">Tight line height</div>
<div class="leading-normal">Normal line height</div>
<div class="leading-relaxed">Relaxed line height</div>
```

### React Hook Usage
```jsx
import { useFonts, fontUtils, fontStyles } from '../hooks/useFonts';

function MyComponent() {
  const fontsLoaded = useFonts();
  
  if (!fontsLoaded) {
    return <div>Loading fonts...</div>;
  }

  return (
    <div>
      <h1 style={fontStyles.h1}>Heading 1</h1>
      <p style={fontStyles.body}>Body text</p>
      <button style={fontStyles.button}>Button</button>
    </div>
  );
}
```

### Font Utility Functions
```jsx
import { fontUtils } from '../hooks/useFonts';

// Get font family for specific language
const englishFont = fontUtils.getFontFamily('en');
const arabicFont = fontUtils.getFontFamily('ar');

// Get font size
const largeSize = fontUtils.getFontSize('lg');

// Get complete font styles
const headingStyles = fontUtils.getFontStyles({
  language: 'en',
  size: '2xl',
  weight: 'semibold',
  lineHeight: 'tight'
});
```

## Material-UI Integration

The font system is fully integrated with Material-UI components through the `FontProvider` component. All MUI components automatically use the global font settings.

### Custom MUI Theme
```jsx
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
    // ... other typography settings
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, Noto Sans Arabic, Cairo, sans-serif',
        },
      },
    },
    // ... other component overrides
  },
});
```

## Bootstrap Integration

Bootstrap components are also styled with the global font system:

```css
.btn {
  font-family: var(--font-primary) !important;
  font-weight: var(--font-weight-medium) !important;
}

.form-control, .form-select {
  font-family: var(--font-primary) !important;
}

.card {
  font-family: var(--font-primary) !important;
}
```

## Performance Optimizations

### Font Loading
- Fonts are preloaded for better performance
- `font-display: swap` is used to prevent invisible text during font load
- Font loading is checked before rendering content

### Font Features
```css
font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
text-rendering: optimizeLegibility;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

## Responsive Design

Font sizes automatically adjust based on screen size:

```css
@media (max-width: 768px) {
  body { font-size: 14px; }
  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  /* ... */
}

@media (min-width: 769px) {
  body { font-size: 16px; }
  h1 { font-size: 32px; }
  h2 { font-size: 28px; }
  /* ... */
}
```

## Best Practices

1. **Use CSS variables** instead of hardcoded font values
2. **Use utility classes** for common font styling
3. **Use the font hook** for dynamic font loading states
4. **Test with both Arabic and English** content
5. **Consider performance** when loading multiple font weights
6. **Use semantic HTML** elements for proper font inheritance

## Troubleshooting

### Fonts Not Loading
- Check browser console for font loading errors
- Verify Google Fonts URLs are accessible
- Check if fonts are properly preloaded

### Inconsistent Font Rendering
- Ensure all components use the global font system
- Check for conflicting CSS rules
- Verify Material-UI theme is properly applied

### Performance Issues
- Monitor font loading times
- Consider reducing font weights if needed
- Use font-display: swap for better UX
