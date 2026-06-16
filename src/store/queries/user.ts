import { queryOptions, useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { extractApiErrorMessage, isNotFoundError } from '@/utils/api-error';
import { QueryFactory } from '@/store/query-factory';
import {
    UserSchema,
    UserListFiltersSchema,
    UserPageResponseSchema,
    UpdateUserPayloadSchema,
    UpdateUserResponseSchema,
    CommitteeBankDetailsSchema,
    CommitteeBankDetailsPayloadSchema,
    UserProfileSchema,
    UpdateUserProfilePayloadSchema,
    type UserListFilters,
    type User,
    type UserPageResponse,
    type UpdateUserPayload,
    type UpdateUserResponse,
    type CommitteeBankDetails,
    type CommitteeBankDetailsPayload,
    type UserProfile,
    type UpdateUserProfilePayload,
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

// ── Error wrapper (mirrors rental.ts) ────────────────────────────────────────

function withApiError<TInput, TOutput>(
    fn: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<TOutput> {
    return async (input) => {
        try {
            return await fn(input);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err));
        }
    };
}

// ── Committee bank details ─────────────────────────────────────────────────────

const bankDetailsQuery = QueryFactory<CommitteeBankDetails, unknown, CommitteeBankDetailsPayload>(
    'bank-details',
    {
        single: CommitteeBankDetailsSchema,
        list: CommitteeBankDetailsSchema.array(),
    },
    '/api/v1/users/me/bank-details',
);

const bankDetailsGetQuery = bankDetailsQuery.customQuery<CommitteeBankDetails, void>({
    responseSchema: CommitteeBankDetailsSchema,
    urlSuffix: () => '',
    queryKeySuffix: () => [],
});

const bankDetailsUpdateMutation = bankDetailsQuery.customMutation<CommitteeBankDetailsPayload>({
    method: 'put',
    urlSuffix: '',
    inputSchema: CommitteeBankDetailsPayloadSchema,
    responseSchema: CommitteeBankDetailsSchema,
    toastMsg: 'Bank details saved',
    invalidateKeys: () => [[...bankDetailsQuery.qk()]],
});

export const bankDetailsKeys = {
    all: bankDetailsQuery.qk(),
};

export function useGetBankDetails() {
    const opts = bankDetailsGetQuery(undefined as void);
    return useQuery<CommitteeBankDetails | null>({
        queryKey: opts.queryKey,
        queryFn: async (ctx) => {
            try {
                return await opts.queryFn!(ctx as never);
            } catch (err) {
                if (isNotFoundError(err)) return null;
                throw err;
            }
        },
    });
}

export function useUpdateBankDetails() {
    return useMutation<CommitteeBankDetails, Error, CommitteeBankDetailsPayload>({
        ...bankDetailsUpdateMutation,
        mutationFn: async (input) => {
            try {
                return await bankDetailsUpdateMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

// ── User profile ───────────────────────────────────────────────────────────────

const profileQuery = QueryFactory<UserProfile, unknown, UpdateUserProfilePayload>(
    'profile',
    {
        single: UserProfileSchema,
        list:   UserProfileSchema.array(),
    },
    '/api/v1/users/me/profile',
);

const profileGetQuery = profileQuery.customQuery<UserProfile, void>({
    responseSchema: UserProfileSchema,
    urlSuffix:      () => '',
    queryKeySuffix: () => [],
});

const profileUpdateMutation = profileQuery.customMutation<UpdateUserProfilePayload>({
    method:         'put',
    urlSuffix:      '',
    inputSchema:    UpdateUserProfilePayloadSchema,
    responseSchema: UserProfileSchema,
    toastMsg:       'Profile updated',
    invalidateKeys: () => [[...profileQuery.qk()]],
});

export const profileKeys = { all: profileQuery.qk() };

export function useGetProfile() {
    const opts = profileGetQuery(undefined as void);
    return useQuery<UserProfile | null>({
        queryKey: opts.queryKey,
        queryFn: async (ctx) => {
            try {
                return await opts.queryFn!(ctx as never);
            } catch (err) {
                if (isNotFoundError(err)) return null;
                throw err;
            }
        },
    });
}

export function useUpdateProfile() {
    return useMutation<UserProfile, Error, UpdateUserProfilePayload>({
        ...profileUpdateMutation,
        mutationFn: withApiError(profileUpdateMutation.mutationFn),
    });
}
