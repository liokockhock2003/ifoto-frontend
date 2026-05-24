import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useAllRequests } from '@/store/queries/request';
import {
    RequestManagementContext,
    DEFAULT_REQUEST_FILTERS,
    type RequestManagementFilters,
} from './context';

export function RequestManagementProvider({ children }: { children: ReactNode }) {
    const [filters, setLocalFilters] = useState<RequestManagementFilters>(DEFAULT_REQUEST_FILTERS);

    const query = useAllRequests(filters);

    const setStatus = useCallback((status?: string) => {
        setLocalFilters((prev) => ({ ...prev, status: status || undefined, page: 0 }));
    }, []);

    const setSearch = useCallback((search?: string) => {
        setLocalFilters((prev) => ({ ...prev, search: search || undefined, page: 0 }));
    }, []);

    const setPage = useCallback((page: number) => {
        setLocalFilters((prev) => ({ ...prev, page: Math.max(page, 0) }));
    }, []);

    const setFilters = useCallback((next: Partial<RequestManagementFilters>) => {
        setLocalFilters((prev) => ({ ...prev, ...next }));
    }, []);

    const resetFilters = useCallback(() => {
        setLocalFilters(DEFAULT_REQUEST_FILTERS);
    }, []);

    const value = useMemo(
        () => ({
            filters,
            setStatus,
            setSearch,
            setPage,
            setFilters,
            resetFilters,
            requests: query.data?.content ?? [],
            totalElements: query.data?.totalElements ?? 0,
            totalPages: query.data?.totalPages ?? 0,
            isLoading: query.isLoading,
            isFetching: query.isFetching,
            isError: query.isError,
            error: query.error ?? null,
            refetch: query.refetch,
        }),
        [filters, setStatus, setSearch, setPage, setFilters, resetFilters, query],
    );

    return (
        <RequestManagementContext.Provider value={value}>
            {children}
        </RequestManagementContext.Provider>
    );
}
