/** API origin for browser requests. 
 *  For Vercel, we always use relative paths for the backend
 *  so we don't accidentally call an old service.
 */
export const getApiOrigin = () => {
  // ABSOLUTELY NEVER USE ABSOLUTE URLS ON VERCEL
  console.log('getApiOrigin called, force returning empty string');
  return '';
};

/** Full URL for an API path, e.g. `/api/products` */
export const apiUrl = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  // ALWAYS RETURN RELATIVE PATH
  console.log('apiUrl called with:', path, 'returning:', p);
  return p;
};
