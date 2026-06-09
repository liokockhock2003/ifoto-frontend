import { createContext, useContext } from 'react';

import type { User, UserListFilters, UserPageResponse } from '@/store/schemas/user';

export type UserManagementFilters = {
    role?: string;
    search?: string;
    page: number;
    size: number;
};

export type UserManagementContextValue = {
    filters: UserManagementFilters;
    setRole: (role?: string) => void;
    setSearch: (search?: string) => void;
    setPage: (page: number) => void;
    setSize: (size: number) => void;
    setFilters: (next: Partial<UserManagementFilters>) => void;
    resetFilters: () => void;
    users: User[];
    pageData?: UserPageResponse;
    totalElements: number;
    totalPages: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
};

export const DEFAULT_USER_MANAGEMENT_FILTERS: UserManagementFilters = {
    page: 0,
    size: 10,
    role: undefined,
    search: undefined,
};

export const UserManagementContext = createContext<UserManagementContextValue | undefined>(undefined);

export function useUserManagementContext(): UserManagementContextValue {
    const context = useContext(UserManagementContext);
    if (!context) {
        throw new Error('useUserManagementContext must be used within <UserManagementProvider>');
    }
    return context;
}

export function toUserListFilters(filters: UserManagementFilters): Partial<UserListFilters> {
    const next: Partial<UserListFilters> = {
        page: filters.page,
        size: filters.size,
    };

    if (filters.role) next.role = filters.role;
    if (filters.search) next.search = filters.search;

    return next;
}
