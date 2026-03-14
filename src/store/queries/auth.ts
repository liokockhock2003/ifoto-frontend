import { useMutation } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
import { AuthResponseSchema, type AuthResponse } from '@/store/schemas/auth';
import { axios } from '@/utils/axios-instance';
import { z } from 'zod';

const authQuery = QueryFactory<AuthResponse, unknown, { username: string; password: string }>(
    'auth',
    {
        single: AuthResponseSchema,
        list: AuthResponseSchema.array(),
        payload: z.object({ username: z.string(), password: z.string() }),
    },
    '/api/v1/auth'
);

// ── Plain async functions (reusable outside hooks) ────────────────────────────
export async function refreshTokenApi(): Promise<AuthResponse> {
    const res = await axios.post('/api/v1/auth/refresh');
    return AuthResponseSchema.parse(res.data);
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function useLogin() {
    return useMutation(authQuery.customMutation({
        urlSuffix: '/login',
        inputSchema: z.object({ username: z.string(), password: z.string() }),
    }));
}

// ── Refresh token ─────────────────────────────────────────────────────────────
export function useRefreshToken() {
    return useMutation({
        mutationFn: refreshTokenApi,    // reuses the same plain function
    });
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function useLogout() {
    return useMutation(authQuery.customMutation<void>({
        method: 'post',
        urlSuffix: '/logout',
        responseSchema: z.unknown().transform(() => null as unknown as AuthResponse),
    }));
}