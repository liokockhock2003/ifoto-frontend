import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { QueryFactory } from '@/store/query-factory';
import { extractApiErrorMessage } from '@/utils/api-error';
import {
    AuthResponseSchema,
    ForgotPasswordPayloadSchema,
    ForgotPasswordResponseSchema,
    ResetPasswordPayloadSchema,
    ResetPasswordResponseSchema,
    type AuthResponse,
    type ForgotPasswordPayload,
    type ForgotPasswordResponse,
    type ResetPasswordPayload,
    type ResetPasswordResponse,
} from '@/store/schemas/auth';
import {
    RegisterPayloadSchema,
    RegisterResponseSchema,
    type RegisterPayload,
    type RegisterResponse,
} from '@/store/schemas/register';
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

const forgotPasswordQuery = QueryFactory<
    ForgotPasswordResponse,
    unknown,
    ForgotPasswordPayload
>(
    'forgot-password',
    {
        single: ForgotPasswordResponseSchema,
        list: ForgotPasswordResponseSchema.array(),
        payload: ForgotPasswordPayloadSchema,
    },
    '/api/v1/auth'
);

const resetPasswordQuery = QueryFactory<
    ResetPasswordResponse,
    unknown,
    ResetPasswordPayload
>(
    'reset-password',
    {
        single: ResetPasswordResponseSchema,
        list: ResetPasswordResponseSchema.array(),
        payload: ResetPasswordPayloadSchema,
    },
    '/api/v1/auth'
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

// ── Login ─────────────────────────────────────────────────────────────────────
export function useLogin() {
    const mutation = authQuery.customMutation<{ username: string; password: string }>({
        urlSuffix: '/login',
        inputSchema: z.object({ username: z.string(), password: z.string() }),
        requestConfig: { skipAuthRefresh: true },
    });

    return useMutation<AuthResponse, AuthApiError, { username: string; password: string }>({
        ...mutation,
        mutationFn: async (input) => {
            try {
                return await mutation.mutationFn(input);
            } catch (err) {
                throw new AuthApiError(
                    isAxiosError(err) && err.response?.status === 401
                        ? 'Wrong username or password'
                        : extractApiErrorMessage(err)
                );
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
        requestConfig: { skipAuthRefresh: true },
    });

    return useMutation<RegisterResponse, AuthApiError, RegisterPayload>({
        ...mutation,
        mutationFn: async (input) => {
            try {
                return await mutation.mutationFn(input);
            } catch (err) {
                const message = extractApiErrorMessage(err);
                const normalized = message.toLowerCase();
                throw new AuthApiError(message, {
                    username: normalized.includes('username already exists') ? 'Username already exists' : undefined,
                    email: normalized.includes('email already exists') ? 'Email already exists' : undefined,
                });
            }
        },
    });
}

export function useSendForgotPasswordLink() {
    const mutation = forgotPasswordQuery.customMutation<ForgotPasswordPayload>({
        method: 'post',
        urlSuffix: '/forgot-password',
        inputSchema: ForgotPasswordPayloadSchema,
        responseSchema: ForgotPasswordResponseSchema,
        requestConfig: { skipAuthRefresh: true },
    });

    return useMutation<ForgotPasswordResponse, AuthApiError, ForgotPasswordPayload>({
        ...mutation,
        mutationFn: async (input) => {
            try {
                return await mutation.mutationFn(input);
            } catch (err) {
                throw new AuthApiError(extractApiErrorMessage(err));
            }
        },
    });
}

export function useResetPassword() {
    const mutation = resetPasswordQuery.customMutation<ResetPasswordPayload>({
        method: 'post',
        urlSuffix: '/reset-password',
        inputSchema: ResetPasswordPayloadSchema,
        responseSchema: ResetPasswordResponseSchema,
        requestConfig: { skipAuthRefresh: true },
    });

    return useMutation<ResetPasswordResponse, AuthApiError, ResetPasswordPayload>({
        ...mutation,
        mutationFn: async (input) => {
            try {
                return await mutation.mutationFn(input);
            } catch (err) {
                throw new AuthApiError(extractApiErrorMessage(err));
            }
        },
    });
}

// ── Plain async functions (reusable outside hooks) ────────────────────────────
export async function refreshTokenApi(): Promise<AuthResponse> {
    const refreshMutation = authQuery.customMutation<void>({
        urlSuffix: '/refresh',
        responseSchema: AuthResponseSchema,
        requestConfig: { skipAuthRefresh: true },
    });
    return refreshMutation.mutationFn(undefined);
}

// ── Logout ────────────────────────────────────────────────────────────────────
export function useLogout() {
    return useMutation(authQuery.customMutation<void>({
        method: 'post',
        urlSuffix: '/logout',
        responseSchema: z.unknown().transform(() => null as unknown as AuthResponse),
    }));
}