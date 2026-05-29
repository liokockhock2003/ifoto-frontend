import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useAvailableEquipment } from '@/store/queries/equipment';
import { useAllRequests } from '@/store/queries/request';
import type { EquipmentRequest } from '@/store/schemas/request';
import {
    RequestManagementContext,
    DEFAULT_REQUEST_FILTERS,
    type RequestManagementFilters,
} from './context';

export function RequestManagementProvider({ children }: { children: ReactNode }) {
    const [filters, setLocalFilters] = useState<RequestManagementFilters>(DEFAULT_REQUEST_FILTERS);
    const [reviewRequest, setReviewRequest] = useState<EquipmentRequest | null>(null);

    const query = useAllRequests(filters);
    const availableEquipmentQuery = useAvailableEquipment({
        startDate: reviewRequest?.requestedStartDate ?? '',
        endDate: reviewRequest?.requestedEndDate ?? '',
        context: 'EVENT_REQUEST',
    });

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
            reviewRequest,
            setReviewRequest,
            availableEquipment: availableEquipmentQuery.data?.mainEquipment ?? [],
            availableSubEquipment: availableEquipmentQuery.data?.subEquipment ?? [],
            isAvailableEquipmentLoading: availableEquipmentQuery.isLoading,
        }),
        [filters, setStatus, setSearch, setPage, setFilters, resetFilters, query, reviewRequest, availableEquipmentQuery],
    );

    return (
        <RequestManagementContext.Provider value={value}>
            {children}
        </RequestManagementContext.Provider>
    );
}
