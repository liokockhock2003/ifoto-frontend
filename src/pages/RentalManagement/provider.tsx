import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useAvailableEquipment } from '@/store/queries/equipment';
import { useAllRentals } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';
import {
    BookingManagementContext,
    DEFAULT_BOOKING_FILTERS,
    type BookingManagementFilters,
} from './context';

export function BookingManagementProvider({ children }: { children: ReactNode }) {
    const [filters, setLocalFilters] = useState<BookingManagementFilters>(DEFAULT_BOOKING_FILTERS);
    const [reviewRental, setReviewRental] = useState<Rental | null>(null);

    const query = useAllRentals(filters);
    const availableEquipmentQuery = useAvailableEquipment({
        startDate: reviewRental?.requestedStartDate ?? '',
        endDate: reviewRental?.requestedEndDate ?? '',
        context: 'RENTAL',
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

    const setFilters = useCallback((next: Partial<BookingManagementFilters>) => {
        setLocalFilters((prev) => ({ ...prev, ...next }));
    }, []);

    const resetFilters = useCallback(() => {
        setLocalFilters(DEFAULT_BOOKING_FILTERS);
    }, []);

    const value = useMemo(
        () => ({
            filters,
            setStatus,
            setSearch,
            setPage,
            setFilters,
            resetFilters,
            rentals: query.data?.content ?? [],
            totalElements: query.data?.totalElements ?? 0,
            totalPages: query.data?.totalPages ?? 0,
            isLoading: query.isLoading,
            isFetching: query.isFetching,
            isError: query.isError,
            error: query.error ?? null,
            refetch: query.refetch,
            reviewRental,
            setReviewRental,
            availableEquipment: availableEquipmentQuery.data?.mainEquipment ?? [],
            availableSubEquipment: availableEquipmentQuery.data?.subEquipment ?? [],
            isAvailableEquipmentLoading: availableEquipmentQuery.isLoading,
        }),
        [filters, setStatus, setSearch, setPage, setFilters, resetFilters, query, reviewRental, availableEquipmentQuery],
    );

    return (
        <BookingManagementContext.Provider value={value}>
            {children}
        </BookingManagementContext.Provider>
    );
}
