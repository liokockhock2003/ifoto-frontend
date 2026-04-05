import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useLogin, useLogout, refreshTokenApi } from '@/store/queries/auth';
import { setAccessToken, setOnUnauthenticated } from '@/utils/axios-instance';
import { UserSchema, type User } from '@/store/schemas/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();
    const loginMutation = useLogin();
    const logoutMutation = useLogout();
    const navigate = useNavigate();

    const buildUser = (input: {
        username: string;
        email: string;
        fullName: string;
        roles: string[];
        profilePicture?: string | null;
    }): User => UserSchema.parse(input);

    // ── Register redirect callback for 401 interceptor ────────────────────────
    useEffect(() => {
        setOnUnauthenticated(() => {
            setUser(null);
            queryClient.clear();
            navigate('/login', { replace: true });
        });
    }, [navigate, queryClient]);

    // ── Restore session on page refresh ───────────────────────────────────────
    // access token is memory-only — use the httpOnly refresh cookie to get a
    // new one silently when the user reloads the page
    useEffect(() => {
        // clean up dead localStorage keys from previous implementations
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('persist');
        localStorage.removeItem('persist:root');

        async function restoreSession() {
            const userData = localStorage.getItem('user');
            if (userData) {
                let rawStoredUser: unknown;
                try {
                    rawStoredUser = JSON.parse(userData);
                } catch {
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                const parsedStoredUser = UserSchema.safeParse(rawStoredUser);
                if (!parsedStoredUser.success) {
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                try {
                    // httpOnly cookie sent automatically — requires backend CORS:
                    // Access-Control-Allow-Origin: http://localhost:5173  (exact, not *)
                    // Access-Control-Allow-Credentials: true
                    const data = await refreshTokenApi();
                    setAccessToken(data.accessToken);
                    const refreshedUser = buildUser({
                        username: data.username,
                        email: data.email,
                        fullName: data.fullName,
                        roles: data.roles,
                        profilePicture: data.profilePicture,
                    });
                    setUser(refreshedUser);
                    localStorage.setItem('user', JSON.stringify(refreshedUser));
                } catch {
                    // refresh failed (CORS / cookie missing / expired)
                    // still restore user state from localStorage so the UI doesn't
                    // flash to /login — the first protected API call will re-trigger
                    // the 401 → refresh flow via the axios interceptor
                    setUser(parsedStoredUser.data);
                }
            }
            setIsLoading(false);
        }

        restoreSession();
    }, []);

    // ── Login ──────────────────────────────────────────────────────────────────
    async function login(username: string, password: string) {
        const data = await loginMutation.mutateAsync({ username, password });

        // access token in memory only
        setAccessToken(data.accessToken);

        const user = buildUser({
            username: data.username,
            email: data.email,
            fullName: data.fullName,
            roles: data.roles,
            profilePicture: data.profilePicture,
        });

        setUser(user);
        // only non-sensitive user profile in localStorage (no tokens)
        localStorage.setItem('user', JSON.stringify(user));
    }

    // ── Logout ─────────────────────────────────────────────────────────────────
    async function logout() {
        try {
            await logoutMutation.mutateAsync();
        } finally {
            setAccessToken(null);            // clear memory
            setUser(null);
            localStorage.removeItem('user'); // no accessToken to remove
            queryClient.clear();
            navigate('/login', { replace: true });
        }
    }

    // ── Role helper ────────────────────────────────────────────────────────────
    const hasRole = (role: string) => user?.roles.includes(role) ?? false;

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            hasRole,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};