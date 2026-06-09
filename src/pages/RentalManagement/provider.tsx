import { useMemo, type ReactNode } from 'react';
import { useAllRentals } from '@/store/queries/rental';
import { useAuth } from '@/store/auth-context';
import { BookingManagementContext } from './context';

// Fetch the full list once; the page filters/paginates client-side per tab.
const FETCH_ALL = { page: 0, size: 1000 } as const;

export function BookingManagementProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const query = useAllRentals(FETCH_ALL);

    const value = useMemo(
        () => ({
            allRentals: query.data?.content ?? [],
            isLoading: query.isLoading,
            isFetching: query.isFetching,
            isError: query.isError,
            error: query.error ?? null,
            refetch: query.refetch,
            currentUsername: user?.username,
        }),
        [query, user],
    );

    return (
        <BookingManagementContext.Provider value={value}>
            {children}
        </BookingManagementContext.Provider>
    );
}
