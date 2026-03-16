import axios from 'axios';
import { clearAuthSession, writeSessionNotice } from '@/modules/auth/lib/authStorage';

const normalizeBaseUrl = (value?: string) => {
  if (!value) return 'http://localhost:4000';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const baseURL = `${normalizeBaseUrl(import.meta.env.VITE_API_URL)}/api`;

export const api = axios.create({
  baseURL,
  timeout: 15000
});

const isLoginRequest = (url?: string) => url?.includes('/auth/login');

// Interceptor para tratar erros de autenticação (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoginRequest(error.config?.url)) {
      clearAuthSession();
      writeSessionNotice('Sua sessão expirou. Faça login novamente.');
      delete api.defaults.headers.common.Authorization;

      // Só redireciona se não estiver já na página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
