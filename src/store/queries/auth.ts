import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { QueryFactory } from '@/store/query-factory';
import { AuthResponseSchema, type AuthResponse } from '@/store/schemas/auth';
import {
    RegisterPayloadSchema,
    RegisterResponseSchema,
    type RegisterPayload,
    type RegisterResponse,
} from '@/store/schemas/register';
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

const registerQuery = QueryFactory<RegisterResponse, unknown, RegisterPayload>(
    'register',
    {
        single: RegisterResponseSchema,
        list: RegisterResponseSchema.array(),
        payload: RegisterPayloadSchema,
    },
    '/api/v1'
);

export type RegisterFieldErrors = {
    username?: string;
    email?: string;
};

export class AuthApiError extends Error {
    fieldErrors?: RegisterFieldErrors;

    constructor(message: string, fieldErrors?: RegisterFieldErrors) {
        super(message);
        this.name = 'AuthApiError';
        this.fieldErrors = fieldErrors;
    }
}

export function isAuthApiError(err: unknown): err is AuthApiError {
    return err instanceof AuthApiError;
}

function extractApiErrorMessage(err: unknown): string {
    if (isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === 'string') return data;

        if (data && typeof data === 'object' && 'message' in data) {
            const message = (data as { message?: unknown }).message;
            if (typeof message === 'string') return message;
        }

        if (typeof err.message === 'string' && err.message.trim().length > 0) {
            return err.message;
        }
    }

    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message;
    }

    return 'Request failed';
}

function mapRegisterFieldErrors(message: string): RegisterFieldErrors {
    const normalized = message.toLowerCase();
    return {
        username: normalized.includes('username already exists') ? 'Username already exists' : undefined,
        email: normalized.includes('email already exists') ? 'Email already exists' : undefined,
    };
}

function normalizeRegisterError(err: unknown): AuthApiError {
    const message = extractApiErrorMessage(err);
    return new AuthApiError(message, mapRegisterFieldErrors(message));
}

function normalizeLoginError(err: unknown): AuthApiError {
    if (isAxiosError(err) && err.response?.status === 401) {
        return new AuthApiError('Wrong username or password');
    }

    return new AuthApiError(extractApiErrorMessage(err));
}

// ── Plain async functions (reusable outside hooks) ────────────────────────────
export async function refreshTokenApi(): Promise<AuthResponse> {
    const res = await axios.post('/api/v1/auth/refresh');
    return AuthResponseSchema.parse(res.data);
}

// ── Login ─────────────────────────────────────────────────────────────────────
export function useLogin() {
    const mutation = authQuery.customMutation<{ username: string; password: string }>({
        urlSuffix: '/login',
        inputSchema: z.object({ username: z.string(), password: z.string() }),
    });

    return useMutation<AuthResponse, AuthApiError, { username: string; password: string }>({
        ...mutation,
        mutationFn: async (input) => {
            try {
                return await mutation.mutationFn(input);
            } catch (err) {
                throw normalizeLoginError(err);
            }
        },
    });
}

// ── Register ──────────────────────────────────────────────────────────────────
export function useRegister() {
    const mutation = registerQuery.customMutation<RegisterPayload>({
        urlSuffix: '/register',
        inputSchema: RegisterPayloadSchema,
        responseSchema: RegisterResponseSchema,
    });

    return useMutation<RegisterResponse, AuthApiError, RegisterPayload>({
        ...mutation,
        mutationFn: async (input) => {
            try {
                return await mutation.mutationFn(input);
            } catch (err) {
                throw normalizeRegisterError(err);
            }
        },
    });
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