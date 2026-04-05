import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { z } from 'zod';

import { QueryFactory } from '@/store/query-factory';
import {
    UserSchema,
    UserListFiltersSchema,
    UserPageResponseSchema,
    UpdateUserPayloadSchema,
    UpdateUserResponseSchema,
    type UserListFilters,
    type User,
    type UserPageResponse,
    type UpdateUserPayload,
    type UpdateUserResponse,
} from '@/store/schemas/user';

const usersQuery = QueryFactory<User, UserListFilters>(
    'users',
    {
        single: UserSchema,
        list: UserSchema.array(),
        filters: UserListFiltersSchema,
    },
    '/api/v1/users'
);

const userUpdateQuery = QueryFactory<UpdateUserResponse, unknown, UpdateUserPayload>(
    'user-update',
    {
        single: UpdateUserResponseSchema,
        list: UpdateUserResponseSchema.array(),
        payload: UpdateUserPayloadSchema,
    },
    '/api/v1/users'
);

const userDeletePayloadSchema = z.object({
    username: z.string().min(1),
});

type DeleteUserPayload = z.infer<typeof userDeletePayloadSchema>;

const userDeleteQuery = QueryFactory<UpdateUserResponse, unknown, DeleteUserPayload>(
    'user-delete',
    {
        single: UpdateUserResponseSchema,
        list: UpdateUserResponseSchema.array(),
        payload: userDeletePayloadSchema,
    },
    '/api/v1/users'
);

const usersPageQuery = usersQuery.customList<UserPageResponse>({
    responseSchema: UserPageResponseSchema,
    queryKeySuffix: 'page',
    requestConfig: { withCredentials: true },
});

const updateUserMutation = userUpdateQuery.customMutation<UpdateUserPayload>({
    method: 'patch',
    urlSuffix: (input) => `/${encodeURIComponent(input.username)}`,
    inputSchema: UpdateUserPayloadSchema,
    responseSchema: UpdateUserResponseSchema,
    invalidateKeys: () => [usersKeys.all],
});

const deleteUserMutation = userDeleteQuery.customMutation<DeleteUserPayload>({
    method: 'delete',
    urlSuffix: (input) => `/${encodeURIComponent(input.username)}`,
    inputSchema: userDeletePayloadSchema,
    responseSchema: UpdateUserResponseSchema,
    invalidateKeys: () => [usersKeys.all],
});

function extractApiErrorMessage(err: unknown): string {
    if (isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === 'object' && data !== null && 'message' in data && typeof data.message === 'string') {
            return data.message;
        }
        return err.message;
    }
    return err instanceof Error ? err.message : 'An unexpected error occurred';
}

export const usersKeys = {
    all: usersQuery.qk(),
    list: (filters?: Partial<UserListFilters>) => ['users', 'page', UserListFiltersSchema.parse(filters ?? {})] as const,
};

export function usersQueryOptions(filters?: Partial<UserListFilters>) {
    const validatedFilters = UserListFiltersSchema.parse(filters ?? {});
    return queryOptions(usersPageQuery(validatedFilters));
}

export function useUsers(filters?: Partial<UserListFilters>) {
    return useQuery(usersQueryOptions(filters));
}

export function useUpdateUser() {
    return useMutation<UpdateUserResponse, Error, UpdateUserPayload>({
        ...updateUserMutation,
        mutationFn: async (input) => {
            try {
                return await updateUserMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useDeleteUser() {
    return useMutation<UpdateUserResponse, Error, DeleteUserPayload>({
        ...deleteUserMutation,
        mutationFn: async (input) => {
            try {
                return await deleteUserMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

// Backward-compatible aliases for existing UI wiring.
export const useReplaceUserRoles = useUpdateUser;
