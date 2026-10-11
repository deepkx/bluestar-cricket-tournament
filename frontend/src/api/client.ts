import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  const url = config.url ?? '';
  if (url.includes('/api/v1/admin/')) {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function apiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const response = (err as { response?: { status?: number; data?: { message?: string; error?: string } } })
    ?.response;
  const data = response?.data;
  if (data?.message) return data.message;
  if (response?.status === 403) {
    return 'Admin sign-in required. Use Admin in the top menu and enter the password again.';
  }
  if (response?.status === 401) return 'Admin sign-in required.';
  if (data?.error) return data.error;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function clearAdminSession() {
  localStorage.removeItem('admin_token');
  delete api.defaults.headers.common.Authorization;
}

export function setAdminToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
