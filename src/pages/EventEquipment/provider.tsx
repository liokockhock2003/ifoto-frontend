import { useMemo, type ReactNode } from 'react';
import { useAllRequests } from '@/store/queries/request';
import { useAuth } from '@/store/auth-context';
import { RequestManagementContext } from './context';

// Fetch the full list once; the page filters/paginates client-side per tab.
const FETCH_ALL = { page: 0, size: 1000 } as const;

export function RequestManagementProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const query = useAllRequests(FETCH_ALL);

    const value = useMemo(
        () => ({
            allRequests: query.data?.content ?? [],
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
        <RequestManagementContext.Provider value={value}>
            {children}
        </RequestManagementContext.Provider>
    );
}
