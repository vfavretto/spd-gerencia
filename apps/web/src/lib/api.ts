import axios from 'axios';

const normalizeBaseUrl = (value?: string) => {
  if (!value) return 'http://localhost:4000';
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const baseURL = `${normalizeBaseUrl(import.meta.env.VITE_API_URL)}/api`;

export const api = axios.create({
  baseURL,
  timeout: 15000
});

export const setAuthToken = (token?: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};
