/**
 * Prefer same-origin API requests unless an explicit production API URL is set.
 * This keeps the deployed frontend and backend on the same host and avoids
 * stale or unreachable absolute URLs baked into the production bundle.
 */
export const getApiOrigin = () => {
  const configuredOrigin = String(import.meta.env.VITE_API_URL || '').trim();
  return configuredOrigin.replace(/\/+$/, '');
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
