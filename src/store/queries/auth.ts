import { useMutation, useQuery } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { QueryFactory } from '@/store/queryFactory';
import { AuthResponseSchema, UserSchema, type AuthResponse, type User } from '@/store/schemas/auth';
import { z } from 'zod';

// Instantiate factory with Zod schemas (focus on mutations for auth)
const authQuery = QueryFactory<AuthResponse, unknown /* no filters */, { username: string; password: string }>(
    'auth',
    {
        single: AuthResponseSchema,
        list: AuthResponseSchema.array(),      // not used, but required by factory
        payload: z.object({ username: z.string(), password: z.string() }),
    },
    '/api/v1/auth'
);

// ── Login ────────────────────────────────────────────────────────────────────
export function useLogin() {
    return useMutation(authQuery.customMutation({
        urlSuffix: '/login',
        inputSchema: z.object({ username: z.string(), password: z.string() }),
    }));
}

// ── Refresh token ─────────────────────────────────────────────────────────────
export function useRefreshToken() {
    return useMutation(authQuery.customMutation<{ refreshToken: string }>({
        urlSuffix: '/refresh',
        inputSchema: z.object({ refreshToken: z.string() }),
    }));
}

// ── Logout ───────────────────────────────────────────────────────────────────
export function useLogout() {
    return useMutation(authQuery.customMutation<void>({
        method: 'post',
        urlSuffix: '/logout',
        responseSchema: z.unknown().transform(() => null as unknown as AuthResponse), // 204 / empty body
    }));
}

// ── Current user (decoded from stored token) ──────────────────────────────────
export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No token');
            const decoded = jwtDecode<{ user: User }>(token);
            return UserSchema.parse(decoded.user);
        },
        enabled: !!localStorage.getItem('accessToken'),
    });
}