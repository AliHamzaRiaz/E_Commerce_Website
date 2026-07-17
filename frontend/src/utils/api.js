
import axios from 'axios';
import { getApiOrigin } from './apiUrl';

// Create Axios instance with default config
const apiClient = axios.create({
  baseURL: getApiOrigin(),
  timeout: 30000,
});

// Keep relative URLs routed through the current origin unless VITE_API_URL is set.
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiOrigin();
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request failed:', {
      method: error?.config?.method,
      url: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
      status: error?.response?.status,
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

export default apiClient;
