import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// ────────────────────────────────────────────────
// Token management (shared with AuthContext)
// ────────────────────────────────────────────────
let accessToken: string | null = localStorage.getItem('accessToken');

export const setAccessToken = (token: string | null) => {
    accessToken = token;
    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        localStorage.removeItem('accessToken');
    }
};

export const getAccessToken = () => accessToken;

// Request interceptor — automatically adds token
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor — only for non-401 errors (refresh stays in context)
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
);

export { api as axios };