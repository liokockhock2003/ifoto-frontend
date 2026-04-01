import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { QueryFactory } from '@/store/query-factory';
import {
    AuthResponseSchema,
    ForgotPasswordPayloadSchema,
    ForgotPasswordResponseSchema,
    ResetPasswordPayloadSchema,
    ResetPasswordResponseSchema,
    SwitchActiveRolePayloadSchema,
    SwitchActiveRoleResponseSchema,
    type AuthResponse,
    type ForgotPasswordPayload,
    type ForgotPasswordResponse,
    type ResetPasswordPayload,
    type ResetPasswordResponse,
    type SwitchActiveRolePayload,
    type SwitchActiveRoleResponse,
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

const userRoleQuery = QueryFactory<
    SwitchActiveRoleResponse,
    unknown,
    SwitchActiveRoleInput
>(
    'user-role',
    {
        single: SwitchActiveRoleResponseSchema,
        list: SwitchActiveRoleResponseSchema.array(),
        payload: z.object({
            username: z.string().min(1),
            roleName: SwitchActiveRolePayloadSchema.shape.roleName,
        }),
    },
    '/api/v1/users'
);

type SwitchActiveRoleInput = SwitchActiveRolePayload & { username: string };

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
        requestConfig: { skipAuthRefresh: true },
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

export function useSwitchActiveRole() {
    const mutation = userRoleQuery.customMutation<SwitchActiveRoleInput>({
        method: 'patch',
        urlSuffix: ({ username }) => `/${encodeURIComponent(username)}/active-role`,
        inputSchema: z.object({
            username: z.string().min(1),
            roleName: SwitchActiveRolePayloadSchema.shape.roleName,
        }),
        responseSchema: SwitchActiveRoleResponseSchema,
    });

    return useMutation<SwitchActiveRoleResponse, AuthApiError, SwitchActiveRoleInput>({
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