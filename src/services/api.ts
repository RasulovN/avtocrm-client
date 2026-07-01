import axios, { AxiosHeaders } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleError } from '../utils/errorHandler';
import { isDev } from '../config/environment';
import { useAuthStore } from '../app/store';

// Axios konfiguratsiyasini loyihaga xos qo'shimcha xossalar bilan kengaytiramiz.
// Shu tufayli xom `api.get/post(...)` chaqiruvlarida ham `skipGlobalErrorHandler`
// kabi maydonlar TypeScript tomonidan qabul qilinadi.
declare module 'axios' {
  export interface AxiosRequestConfig {
    expectedErrorStatuses?: number[];
    skipGlobalErrorHandler?: boolean;
    _retry?: boolean;
    _refreshFailed?: boolean;
  }
}

// API manzili .env fayllardan olinadi (.env.development / .env.production).
// Dev: Vite proxy orqali lokal backend (default `/api`). Prod: to'liq API URL. https://api.zumex.uz 
const BASE_URL = import.meta.env.VITE_API_URL || (isDev ? '/api' : 'https://api.zumex.uz/api');

// Media/rasm origin'i. Dev'da bo'sh — Vite proxy `/media`'ni lokal backendga uzatadi.
const MEDIA_ORIGIN =
  import.meta.env.VITE_MEDIA_ORIGIN ?? (isDev ? '' : 'https://api.zumex.uz');

export const URL = MEDIA_ORIGIN || '/';
export const MEDIA_URL = `${MEDIA_ORIGIN}/`;
export const API_BASE_URL = BASE_URL;
export const API_ORIGIN = MEDIA_ORIGIN;

export interface ApiRequestConfig extends AxiosRequestConfig {
  expectedErrorStatuses?: number[];
  skipGlobalErrorHandler?: boolean;
  _retry?: boolean;
  _refreshFailed?: boolean;
}

const removeAuth = async () => {
  localStorage.removeItem('crm_auth_time');
  
  // Update the auth store state and call logout API
  useAuthStore.getState().logout();
};

const hasStoredAuth = () => Boolean(localStorage.getItem('crm_auth_time'));

interface FailedRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

// Auth endpointlari — 401 kelganda refresh URINISHISIZ darhol logout qilinadi
// (login/refresh/logout o'zi 401 qaytarsa, qayta refresh rekursiyasidan qochamiz).
const AUTH_ENDPOINTS = [
  '/auth/login/', '/auth/refresh/', '/auth/logout/',
  '/users/login/', '/users/auth/refresh/', '/users/logout/',
];
// Bu endpointlarda 401/404 loglanmaydi va rekursiv logout qilinmaydi (kutilgan holat).
const SILENT_401_404_ENDPOINTS = ['/users/logout/', '/products/categories', '/debts/'];

const matchesAny = (url: string, list: string[]): boolean =>
  list.some((endpoint) => url.includes(endpoint));

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,

  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
});

type AppLanguage = 'uz' | 'cyrl' | 'en' | 'ru';

const normalizeLanguage = (lang: string | null | undefined): AppLanguage => {
  if (!lang) return 'uz';
  const lower = lang.toLowerCase();
  if (lower.startsWith('uz-cyrl') || lower.startsWith('cyrl')) return 'cyrl';
  if (lower.startsWith('ru')) return 'ru';
  if (lower.startsWith('en')) return 'en';
  if (lower.startsWith('uz')) return 'uz';
  return 'uz';
};

const getCurrentLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') return 'uz';
  const stored = localStorage.getItem('i18nextLng');
  if (stored) {
    const normalized = normalizeLanguage(stored);
    if (stored !== normalized) {
      localStorage.setItem('i18nextLng', normalized);
    }
    return normalized;
  }
  const htmlLang = document?.documentElement?.lang;
  const normalized = normalizeLanguage(htmlLang || 'uz');
  localStorage.setItem('i18nextLng', normalized);
  return normalized;
};

// Request interceptor - no auth token needed, server uses cookies
api.interceptors.request.use(
  (config) => {
    const lang = getCurrentLanguage();
    const ACCEPT_LANGUAGE_MAP: Record<AppLanguage, string> = {
      uz: 'uz',
      cyrl: 'uz-Cyrl',
      ru: 'ru',
      en: 'en',
    };
    const apiLang = ACCEPT_LANGUAGE_MAP[lang] ?? 'uz';
    const headers = AxiosHeaders.from(config.headers ?? {});
    headers.set('Accept-Language', apiLang);

    // Multi-tenant: tanlangan do'kon (CRM endpointlari uchun) X-Store-ID header
    const activeStoreId = typeof window !== 'undefined' ? localStorage.getItem('active_store_id') : null;
    if (activeStoreId) {
      headers.set('X-Store-ID', activeStoreId);
    }
    config.headers = headers;

    if (config.data instanceof FormData) {
      headers.delete('Content-Type');
    }
    return config;
  },

  (error) => {
    handleError(error, { showToast: false });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (no logging on success)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const config = (error.config || {}) as ApiRequestConfig;
    const isExpectedStatus = typeof status === 'number' && config.expectedErrorStatuses?.includes(status);
    const url = error.config?.url || '';

    // Prevent logout recursion and suppress logging for these endpoints
    if (matchesAny(url, SILENT_401_404_ENDPOINTS)) {
      if (status === 401 || status === 404) {
        return Promise.reject(error);
      }
    }

    if (config.skipGlobalErrorHandler || isExpectedStatus) {
      return Promise.reject(error);
    }

    if (status === 401) {
      if (matchesAny(url, AUTH_ENDPOINTS)) {
        void removeAuth();
        return Promise.reject(error);
      }

      if (!hasStoredAuth()) {
        return Promise.reject(error);
      }

      const originalRequest = error.config as ApiRequestConfig;
      if (originalRequest && !originalRequest._retry && !originalRequest._refreshFailed) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        return new Promise((resolve, reject) => {
          api.post('/auth/refresh/', undefined, { skipGlobalErrorHandler: true })
            .then(() => {
              localStorage.setItem('crm_auth_time', Date.now().toString());
              processQueue(null);
              resolve(api(originalRequest));
            })
            .catch((err) => {
              originalRequest._refreshFailed = true;
              processQueue(err);
              void removeAuth();
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      void removeAuth();
      return Promise.reject(error);
    } else {
      handleError(error, { 
        showToast: !isDev, 
        logData: { status, url: error.config?.url }
      });
    }
    
    return Promise.reject(error);
  }
);


// Generic API methods
export const apiClient = {
  get: <T>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    api.get<T>(url, config),

  post: <T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    api.post<T>(url, data, config),

  put: <T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    api.put<T>(url, data, config),

  patch: <T>(url: string, data?: unknown, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    api.patch<T>(url, data, config),

  delete: <T>(url: string, config?: ApiRequestConfig): Promise<AxiosResponse<T>> =>
    api.delete<T>(url, config),
};

export default api;
