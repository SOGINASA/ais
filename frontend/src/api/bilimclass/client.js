import axios from 'axios';

const bilimClassClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5252/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests
bilimClassClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Return response data directly
bilimClassClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Don't clear session for login/register requests
      const isAuthRequest = error.config?.url?.includes('/auth/');
      if (!isAuthRequest) {
        // Only clear session if the request that failed used the current token.
        // This prevents a race condition where pre-login 401 responses arrive
        // after a successful login and wipe the newly stored token.
        const currentToken = localStorage.getItem('access_token');
        const requestToken = error.config?.headers?.Authorization?.replace('Bearer ', '');
        if (!currentToken || currentToken === requestToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            window.location.replace('/login');
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default bilimClassClient;
