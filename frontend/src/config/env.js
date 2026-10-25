/**
 * Application environment configuration.
 */

export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE || 'Coffiko Sales Intelligence',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
};
