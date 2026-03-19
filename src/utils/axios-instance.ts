import axios, { type InternalAxiosRequestConfig } from 'axios';

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

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:8080'),
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,   // sends httpOnly cookies (refresh token) on every request
});

// ── Token management — memory only, never localStorage ───────────────────────
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;   // only lives in JS memory — cleared on page reload
};

export const getAccessToken = () => accessToken;

// ── Refresh queue ─────────────────────────────────────────────────────────────
// prevents multiple simultaneous refresh calls when many requests 401 at once
let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
    queue.forEach(cb => cb(token));
    queue = [];
};

// callback to redirect to login — set by AuthProvider at runtime
let onUnauthenticated: () => void = () => {
    window.location.href = '/login';
};

export const setOnUnauthenticated = (cb: () => void) => {
    onUnauthenticated = cb;
};

// ── Request interceptor — attach token ────────────────────────────────────────
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// ── Response interceptor — handle 401 + refresh queue ────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config as AuthInternalRequestConfig;

        // Caller explicitly opts out from refresh flow (e.g. login/register/refresh)
        if (original?.skipAuthRefresh) {
            return Promise.reject(error);
        }

        // only handle 401, and only once per request (_retry flag)
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        // if already refreshing, queue this request until refresh completes
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                queue.push((token) => {
                    if (!token) return reject(error);
                    original.headers.Authorization = `Bearer ${token}`;
                    resolve(api(original));
                });
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            // call refresh endpoint — withCredentials set at instance level
            const res = await api.post('/api/v1/auth/refresh', undefined, { skipAuthRefresh: true });
            const newToken = res.data.accessToken as string;

            setAccessToken(newToken);
            processQueue(newToken);

            // retry original request with new token
            original.headers.Authorization = `Bearer ${newToken}`;
            return api(original);
        } catch (refreshError) {
            // refresh failed — clear everything and redirect to login
            processQueue(null);
            setAccessToken(null);
            localStorage.removeItem('user');
            onUnauthenticated();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export { api as axios };