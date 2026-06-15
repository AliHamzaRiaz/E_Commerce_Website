import axios from 'axios';
import { apiUrl } from './apiUrl';

const userApi = axios.create();

userApi.interceptors.request.use((config) => {
  // Set dynamic base URL for every request!
  config.baseURL = apiUrl('/api/users');
  
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
