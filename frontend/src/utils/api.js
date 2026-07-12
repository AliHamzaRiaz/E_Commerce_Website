
import axios from 'axios';
import { getApiUrl } from './apiUrl';

// Create Axios instance with default config
const apiClient = axios.create({
  timeout: 30000, // Increase timeout to 30 seconds
});

// Request interceptor to set base URL dynamically
apiClient.interceptors.request.use(
  (config) => {
    // Set base URL for each request (apiUrl handles dev/prod)
    if (config.url) {
      // If it's a relative URL, prepend the correct base URL
      if (config.url.startsWith('/')) {
        config.url = getApiUrl(config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
