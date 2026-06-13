/**
 * Get the base API URL, which should include any origin and path prefix.
 * - In development: use Vite proxy (empty string)
 * - In production: use VITE_API_URL environment variable
 */
export const getApiOrigin = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || '';
  }
  return '';
};

/**
 * Build a complete API URL from a relative path like /api/products.
 */
export const getApiUrl = (path) => {
  const origin = getApiOrigin();
  return `${origin}${path}`;
};

/**
 * Alias for getApiUrl for backward compatibility (existing files import 'apiUrl'
 */
export const apiUrl = getApiUrl;
