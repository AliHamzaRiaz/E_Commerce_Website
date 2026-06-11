/** API origin for browser requests. */
export const getApiOrigin = () => {
  return '';
};

/** Full URL for an API path, e.g. `/api/products` */
export const apiUrl = (path) => {
  // HARD-CODED TO RELATIVE PATH TO AVOID OLD BACKEND ISSUES
  const p = path.startsWith('/') ? path : `/${path}`;
  console.log('apiUrl called, returning:', p);
  return p;
};
