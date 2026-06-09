/** API origin for browser requests. Empty = same origin (Vite `/api` proxy in dev). */
export const getApiOrigin = () => String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/** Full URL for an API path, e.g. `/api/products` */
export const apiUrl = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  const origin = getApiOrigin();
  return origin ? `${origin}${p}` : p;
};
