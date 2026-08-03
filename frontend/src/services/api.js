/**
 * Axios API instance with base URL, auth token injection, and error handling.
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { auth } from '../firebase/firebaseConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ── Request Interceptor: Inject Firebase Auth Token ──
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle Errors Globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Token expired or invalid — redirect to login
        console.warn('Unauthorized — redirecting to login');
        // Could dispatch a logout action here
      }

      if (status === 403) {
        console.warn('Forbidden — insufficient permissions');
      }

      // Return the error message from the API
      const message = data?.message || 'An error occurred';
      error.message = message;
    } else if (error.request) {
      error.message = 'Network error — please check your connection';
    }

    return Promise.reject(error);
  }
);

export default api;
