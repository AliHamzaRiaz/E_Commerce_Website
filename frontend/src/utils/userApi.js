import axios from 'axios';
import { apiUrl } from './apiUrl';

const userApi = axios.create({
  baseURL: apiUrl('/api/users'),
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('userToken') || '';
  if (!token) return config;
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
      authorization: `Bearer ${token}`,
    },
  };
});

export default userApi;
