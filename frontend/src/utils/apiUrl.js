/** API origin for browser requests. */
export const getApiOrigin = () => {
  return 'https://libbaas-backend.onrender.com';
};

/** Full URL for an API path, e.g. `/api/products` */
export const apiUrl = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  const origin = getApiOrigin();
  const fullUrl = origin ? `${origin}${p}` : p;
  console.log('apiUrl called, returning:', fullUrl);
  return fullUrl;
};
