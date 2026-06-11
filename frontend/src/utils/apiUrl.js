/** API origin for browser requests. 
 *  For Vercel, we always use relative paths for the backend
 *  so we don't accidentally call an old service.
 */
export const getApiOrigin = () => {
  // Force relative paths for production on Vercel
  return '';
};

/** Full URL for an API path, e.g. `/api/products` */
export const apiUrl = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  // Always return relative path
  return p;
};
