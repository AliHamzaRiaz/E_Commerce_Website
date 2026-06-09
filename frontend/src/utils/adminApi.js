import axios from 'axios';
import { getApiOrigin } from './apiUrl';

const adminBase = () => {
  const origin = getApiOrigin();
  return origin ? `${origin}/api/admin` : '/api/admin';
};

const adminApi = axios.create({
  baseURL: adminBase(),
});

adminApi.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken') || '';
  const adminKey = localStorage.getItem('adminKey') || '';
  const authHeaders = adminToken
    ? { authorization: `Bearer ${adminToken}`, Authorization: `Bearer ${adminToken}` }
    : adminKey
      ? { 'x-admin-key': adminKey }
      : {};
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...authHeaders,
    },
  };
});

adminApi.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminKey');
      const isAdminHost = window.location.hostname.startsWith('admin.');
      const loginPath = isAdminHost ? '/login' : '/admin/login';
      if (window.location.pathname !== loginPath) window.location.assign(loginPath);
    }
    return Promise.reject(error);
  }
);

export default adminApi;
