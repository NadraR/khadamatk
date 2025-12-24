// Environment configuration for different deployment stages

const getEnvironmentConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  // Railway backend URL (update this with your actual Railway domain)
  const RAILWAY_BACKEND_URL = 'https://khadamatk-production.up.railway.app';
  
  // Vercel frontend URL (update this with your actual Vercel domain)
  const VERCEL_FRONTEND_URL = 'https://khadamatk-frontend.vercel.app';
  
  if (isDevelopment) {
    return {
      API_URL: 'http://127.0.0.1:8000',
      WS_URL: 'ws://127.0.0.1:8000', // Direct backend connection
      FRONTEND_URL: 'http://localhost:5173',
      ENVIRONMENT: 'development'
    };
  }
  
  if (isProduction) {
    return {
      API_URL: RAILWAY_BACKEND_URL,
      WS_URL: RAILWAY_BACKEND_URL.replace('https', 'wss'),
      FRONTEND_URL: VERCEL_FRONTEND_URL,
      ENVIRONMENT: 'production'
    };
  }
  
  // Default fallback
  return {
    API_URL: 'http://127.0.0.1:8000',
    WS_URL: 'ws://localhost:5173',
    FRONTEND_URL: 'http://localhost:5173',
    ENVIRONMENT: 'development'
  };
};

export const config = getEnvironmentConfig();

// Export individual values for easy access
export const {
  API_URL,
  WS_URL,
  FRONTEND_URL,
  ENVIRONMENT
} = config;

export default config;
