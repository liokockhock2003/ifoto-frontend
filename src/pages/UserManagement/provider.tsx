import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { useUsers } from '@/store/queries/user';

import {
    DEFAULT_USER_MANAGEMENT_FILTERS,
    toUserListFilters,
    UserManagementContext,
    type UserManagementFilters,
} from './context';

type UserManagementProviderProps = {
    children: ReactNode;
    initialFilters?: Partial<UserManagementFilters>;
};

export function UserManagementProvider({
    children,
    initialFilters,
}: UserManagementProviderProps) {
    const [filters, setLocalFilters] = useState<UserManagementFilters>({
        ...DEFAULT_USER_MANAGEMENT_FILTERS,
        ...initialFilters,
    });

    const queryFilters = useMemo(() => toUserListFilters(filters), [filters]);
    const usersQuery = useUsers(queryFilters);

    const setRole = useCallback((role?: string) => {
        setLocalFilters((prev) => ({
            ...prev,
            role: role || undefined,
            page: 0,
        }));
    }, []);

    const setSearch = useCallback((search?: string) => {
        setLocalFilters((prev) => ({
            ...prev,
            search: search || undefined,
            page: 0,
        }));
    }, []);

    const setPage = useCallback((page: number) => {
        setLocalFilters((prev) => ({ ...prev, page: Math.max(page, 0) }));
    }, []);

    const setSize = useCallback((size: number) => {
        setLocalFilters((prev) => ({
            ...prev,
            size: Math.max(size, 1),
            page: 0,
        }));
    }, []);

    const setFilters = useCallback((next: Partial<UserManagementFilters>) => {
        setLocalFilters((prev) => ({ ...prev, ...next }));
    }, []);

    const resetFilters = useCallback(() => {
        setLocalFilters({
            ...DEFAULT_USER_MANAGEMENT_FILTERS,
            ...initialFilters,
        });
    }, [initialFilters]);

    const value = useMemo(
        () => ({
            filters,
            setRole,
            setSearch,
            setPage,
            setSize,
            setFilters,
            resetFilters,
            users: usersQuery.data?.content ?? [],
            pageData: usersQuery.data,
            totalElements: usersQuery.data?.totalElements ?? 0,
            totalPages: usersQuery.data?.totalPages ?? 0,
            isLoading: usersQuery.isLoading,
            isFetching: usersQuery.isFetching,
            isError: usersQuery.isError,
            error: usersQuery.error ?? null,
            refetch: usersQuery.refetch,
        }),
        [
            filters,
            resetFilters,
            setFilters,
            setPage,
            setRole,
            setSearch,
            setSize,
            usersQuery.data,
            usersQuery.error,
            usersQuery.isError,
            usersQuery.isFetching,
            usersQuery.isLoading,
            usersQuery.refetch,
        ],
    );

    return <UserManagementContext.Provider value={value}>{children}</UserManagementContext.Provider>;
}
