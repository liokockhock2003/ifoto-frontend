import { createContext, useContext } from 'react';
import type { Rental } from '@/store/schemas/rental';

export type BookingManagementFilters = {
    status?: string;
    search?: string;
    page: number;
    size: number;
};

export const DEFAULT_BOOKING_FILTERS: BookingManagementFilters = {
    page: 0,
    size: 10,
};

export type BookingManagementContextValue = {
    filters: BookingManagementFilters;
    setStatus: (status?: string) => void;
    setSearch: (search?: string) => void;
    setPage: (page: number) => void;
    setFilters: (next: Partial<BookingManagementFilters>) => void;
    resetFilters: () => void;
    rentals: Rental[];
    totalElements: number;
    totalPages: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
};

export const BookingManagementContext = createContext<BookingManagementContextValue | undefined>(undefined);

export function useBookingManagementContext(): BookingManagementContextValue {
    const ctx = useContext(BookingManagementContext);
    if (!ctx) throw new Error('useBookingManagementContext must be used within <BookingManagementProvider>');
    return ctx;
}
