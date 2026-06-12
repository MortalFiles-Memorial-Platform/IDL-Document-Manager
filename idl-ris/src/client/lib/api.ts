import axios from 'axios';
import { getToken } from './auth';
import { mockAuthService } from './mockAuth';

const isGitHubPages = (): boolean => {
  return window.location.hostname === 'mortalfiles-memorial-platform.github.io';
};

const getBackendUrl = (): string => {
  const backendUrl = (globalThis as any).__BACKEND_URL__;
  if (backendUrl) {
    return backendUrl;
  }
  return '';
};

const backendUrl = getBackendUrl();
const baseURL = isGitHubPages() && backendUrl ? `${backendUrl}/api` : '/api';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !error.config._retry401) {
      error.config._retry401 = true;
      const { removeToken } = await import('./auth');
      removeToken();
      window.location.href = '/';
      return Promise.reject(error);
    }

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout. Please check your connection.';
      } else if (!navigator.onLine) {
        error.message = 'No internet connection. Please check your network.';
      } else {
        error.message = 'Network error. Please try again.';
      }
    }

    if (isGitHubPages() && error.config && !error.config._mockRetry) {
      const url = error.config.url || '';

      if (url === '/auth/login' && error.config.method === 'post') {
        error.config._mockRetry = true;
        const { email, password } = error.config.data;
        try {
          const result = await mockAuthService.login(email, password);
          return Promise.resolve({
            data: result,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          });
        } catch (mockError) {
          return Promise.reject({
            ...error,
            response: { status: 401, data: { message: 'Invalid credentials.' } }
          });
        }
      }

      if (url === '/auth/me' && error.config.method === 'get') {
        error.config._mockRetry = true;
        const token = getToken();
        if (token) {
          const decodedEmail = atob(token).split(':')[0];
          const user = mockAuthService['_findUser']?.(decodedEmail) || {
            id: 1,
            email: decodedEmail,
            firstName: 'User',
            lastName: 'Admin',
            role: 'ADMIN'
          };
          return Promise.resolve({
            data: user,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          });
        }
        return Promise.reject(error);
      }

      if (url === '/auth/verify-email' && error.config.method === 'post') {
        error.config._mockRetry = true;
        const { email } = error.config.data;
        try {
          const exists = await mockAuthService.verifyEmail(email);
          return Promise.resolve({
            data: { exists, message: exists ? 'Email verified.' : 'Email not found.' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          });
        } catch (mockError) {
          return Promise.reject(error);
        }
      }

      if (url === '/auth/reset-password' && error.config.method === 'post') {
        error.config._mockRetry = true;
        const { email, newPassword } = error.config.data;
        try {
          await mockAuthService.resetPassword(email, newPassword);
          return Promise.resolve({
            data: { message: 'Password reset successfully. Please login with your new password.' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: error.config
          });
        } catch (mockError) {
          return Promise.reject({
            ...error,
            response: { status: 404, data: { message: 'User not found.' } }
          });
        }
      }
    }

    return Promise.reject(error);
  }
);
