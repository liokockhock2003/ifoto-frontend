// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLogin, useRefreshToken, useLogout } from '@/store/queries/auth';
import { axios, setAccessToken, getAccessToken } from '@/utils/axios-instance';
import { jwtDecode } from 'jwt-decode';
import type { User } from '@/store/schemas/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: string) => boolean;
    hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    const loginMutation = useLogin();
    const refreshMutation = useRefreshToken();
    const logoutMutation = useLogout();

    // Restore user from stored token on app start
    useEffect(() => {
        const token = getAccessToken();
        if (token) {
            try {
                const decoded = jwtDecode<{ user: User }>(token);
                setUser(decoded.user);
            } catch { }
        }
    }, []);

    // ────────────────────────────────────────────────
    // Refresh logic (still in context because we need React Query)
    // ────────────────────────────────────────────────
    useEffect(() => {
        const responseIntercept = axios.interceptors.response.use(
            (res) => res,
            async (error) => {
                if (error.response?.status === 401) {
                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        try {
                            const authData = await refreshMutation.mutateAsync({ refreshToken });
                            setAccessToken(authData.accessToken);        // ← update axios instance
                            // Retry the original request
                            return axios(error.config);
                        } catch {
                            await logout(); // Refresh failed → force logout
                        }
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(responseIntercept);
    }, [refreshMutation]);

    const login = async (username: string, password: string) => {
        const authData = await loginMutation.mutateAsync({ username, password });
        setAccessToken(authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        const decoded = jwtDecode<{ user: User }>(authData.accessToken);
        setUser(decoded.user);
    };

    const logout = async () => {
        await logoutMutation.mutateAsync(undefined);
        setAccessToken(null);
        localStorage.removeItem('refreshToken');
        setUser(null);
        queryClient.clear(); // or invalidateQueries()
    };

    const hasRole = (role: string) => user?.roles.includes(role) ?? false;
    const hasPermission = (perm: string) => user?.permissions.includes(perm) ?? false;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasRole, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};