import axios, { type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { isRateLimitError } from '@/utils/api-error';

declare module 'axios' {
    interface AxiosRequestConfig {
        skipAuthRefresh?: boolean;
        _retry?: boolean;
    }
}

type AuthInternalRequestConfig = InternalAxiosRequestConfig & {
    skipAuthRefresh?: boolean;
    _retry?: boolean;
};

// Resolved API origin — empty in dev (Vite proxies /api → :8080), VITE_API_URL in prod.
// Exported so non-axios callers (e.g. SSE fetch in use-rental-events) hit the same backend.
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:8080');

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,   // sends httpOnly cookies (refresh token) on every request
});

// ── Token management — sessionStorage-backed ─────────────────────────────────
// sessionStorage survives same-tab page refreshes but is cleared when the tab
// closes, keeping the effective session lifetime while avoiding a refresh call
// on every reload.
const _SESSION_KEY = '__ift_at__';

export const setAccessToken = (token: string | null) => {
    if (token) sessionStorage.setItem(_SESSION_KEY, token);
    else sessionStorage.removeItem(_SESSION_KEY);
};

export const getAccessToken = () => sessionStorage.getItem(_SESSION_KEY);

// Returns true if the JWT is expired or within bufferSeconds of expiring.
// Malformed or missing exp claims are treated as expired.
export const isTokenExpired = (token: string, bufferSeconds = 60): boolean => {
    try {
        const base64Payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64Payload)) as Record<string, unknown>;
        if (typeof payload.exp !== 'number') return true;
        return Date.now() / 1000 >= payload.exp - bufferSeconds;
    } catch {
        return true;
    }
};

// callback to redirect to login — set by AuthProvider at runtime
let onUnauthenticated: () => void = () => {
    window.location.href = '/login';
};

export const setOnUnauthenticated = (cb: () => void) => {
    onUnauthenticated = cb;
};

// ── Refresh lock ──────────────────────────────────────────────────────────────
// Single in-flight refresh shared across all concurrent 401s. All waiting
// requests chain onto the same Promise, so only one /auth/refresh call is made
// even when many requests expire simultaneously. Avoids the second call failing
// when the backend rotates the refresh token on first use.
let refreshPromise: Promise<string> | null = null;

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const original = error.config as AuthInternalRequestConfig;

        // Caller explicitly opts out from refresh flow (e.g. login/register/refresh)
        if (original?.skipAuthRefresh) {
            return Promise.reject(error);
        }

        // 429 Too Many Requests — show toast with retry time, don't auto-retry
        if (isRateLimitError(error)) {
            const retryAfter = error.response?.headers?.['retry-after'];
            const seconds = retryAfter ? parseInt(retryAfter, 10) : null;
            toast.error(
                seconds
                    ? `Too many requests. Please try again in ${seconds}s.`
                    : 'Too many requests. Please try again later.'
            );
            return Promise.reject(error);
        }

        // only handle 401, and only once per request (_retry flag)
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        original._retry = true;

        if (!refreshPromise) {
            refreshPromise = api
                .post<{ accessToken: string }>('/api/v1/auth/refresh', undefined, { skipAuthRefresh: true })
                .then(res => {
                    const newToken = res.data.accessToken;
                    setAccessToken(newToken);
                    return newToken;
                })
                .catch(refreshError => {
                    setAccessToken(null);
                    localStorage.removeItem('user');
                    onUnauthenticated();
                    return Promise.reject(refreshError);
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        return refreshPromise.then(newToken => {
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
        });
    }
);

export { api as axios };