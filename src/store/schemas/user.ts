import { z } from 'zod';

export const UserSchema = z.object({
    id: z.number().int().nonnegative(),
    username: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    isActive: z.boolean(),
    isLocked: z.boolean(),
    roles: z.array(z.string()),
});

export const SortSchema = z.object({
    sorted: z.boolean(),
    unsorted: z.boolean(),
    empty: z.boolean(),
});

export const PageableSchema = z.object({
    pageNumber: z.number().int().nonnegative(),
    pageSize: z.number().int().positive(),
    sort: SortSchema,
    offset: z.number().int().nonnegative(),
    paged: z.boolean(),
    unpaged: z.boolean(),
});

export const UserPageResponseSchema = z.object({
    content: z.array(UserSchema),
    pageable: PageableSchema,
    totalPages: z.number().int().nonnegative(),
    totalElements: z.number().int().nonnegative(),
    last: z.boolean(),
    size: z.number().int().positive(),
    number: z.number().int().nonnegative(),
    sort: SortSchema,
    numberOfElements: z.number().int().nonnegative(),
    first: z.boolean(),
    empty: z.boolean(),
});

export const UserListFiltersSchema = z.object({
    role: z.string().optional(),
    page: z.number().int().nonnegative().default(0),
    size: z.number().int().positive().default(10),
    search: z.string().optional(),
});

export const UpdateUserPayloadSchema = z
    .object({
        username: z.string().min(1),
        roles: z.array(z.string().min(1)).min(1).optional(),
        locked: z.boolean().optional(),
    })
    .refine((value) => value.roles !== undefined || value.locked !== undefined, {
        message: 'At least one of roles or locked must be provided',
    });

export const UpdateUserResponseSchema = z.object({
    userId: z.number().int().nonnegative(),
    username: z.string(),
    fullName: z.string(),
    roles: z.array(z.string()),
    locked: z.boolean(),
});

export type User = z.infer<typeof UserSchema>;
export type Sort = z.infer<typeof SortSchema>;
export type Pageable = z.infer<typeof PageableSchema>;
export type UserPageResponse = z.infer<typeof UserPageResponseSchema>;
export type UserListFilters = z.infer<typeof UserListFiltersSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
