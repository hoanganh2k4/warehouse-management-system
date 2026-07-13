import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { authStorage } from './auth-storage';

export const apiClient = axios.create({
  baseURL: '/api',
});

const rawClient = axios.create({ baseURL: '/api' });

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RetriableRequestConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = authStorage.getRefreshToken();
      if (!refreshToken) throw new Error('Không có refresh token');

      const response = await rawClient.post<{
        success: boolean;
        data?: { accessToken: string; refreshToken: string };
      }>('/auth/refresh', { refreshToken });

      const body = response.data;
      if (!body.success || !body.data) throw new Error('Refresh token thất bại');

      authStorage.saveTokens(body.data.accessToken, body.data.refreshToken);
      return body.data.accessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function redirectToLogin() {
  authStorage.clear();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && body.success === false) {
      return Promise.reject(new Error(body.message ?? 'Request failed'));
    }
    return body?.data;
  },
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const url = originalRequest?.url ?? '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      originalRequest &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    const message =
      error.response?.data?.message ?? error.message ?? 'Network error';
    error.message = message;
    return Promise.reject(error);
  },
);

export default apiClient;