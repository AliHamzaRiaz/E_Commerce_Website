/** API origin for browser requests. */
export const getApiOrigin = () => {
  // In development, use relative path for Vite proxy
  // In production, set this to your backend URL (e.g., https://your-backend.onrender.com)
  return import.meta.env.PROD ? 'https://libbaas-pk-backend.onrender.com' : '';
};

/** Full URL for an API path, e.g. `/api/products` */
export const apiUrl = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  const origin = getApiOrigin();
  const fullUrl = origin ? `${origin}${p}` : p;
  console.log('apiUrl called, returning:', fullUrl);
  return fullUrl;
};
