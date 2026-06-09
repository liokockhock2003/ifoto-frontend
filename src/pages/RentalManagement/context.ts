import { createContext, useContext } from 'react';
import type { Rental } from '@/store/schemas/rental';

export type BookingManagementContextValue = {
    // Full rental list (fetched once) — the page tabs/sub-filters/search filter it client-side.
    allRentals: Rental[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
    currentUsername?: string;
};

export const BookingManagementContext = createContext<BookingManagementContextValue | undefined>(undefined);

export function useBookingManagementContext(): BookingManagementContextValue {
    const ctx = useContext(BookingManagementContext);
    if (!ctx) throw new Error('useBookingManagementContext must be used within <BookingManagementProvider>');
    return ctx;
}
