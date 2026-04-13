import { useMemo, type ReactNode } from 'react';

import { useEvents } from '@/store/queries/event';

import { EventManagementContext } from './context';

type EventManagementProviderProps = {
    children: ReactNode;
};

export function EventManagementProvider({ children }: EventManagementProviderProps) {
    const eventsQuery = useEvents();

    const value = useMemo(
        () => ({
            events: eventsQuery.data ?? [],

            isLoading: eventsQuery.isLoading,
            isFetching: eventsQuery.isFetching,
            isError: eventsQuery.isError,
            error: eventsQuery.error ?? null,
            refetch: eventsQuery.refetch,
        }),
        [
            eventsQuery.data,
            eventsQuery.error,
            eventsQuery.isError,
            eventsQuery.isFetching,
            eventsQuery.isLoading,
            eventsQuery.refetch,
        ],
    );

    return (
        <EventManagementContext.Provider value={value}>
            {children}
        </EventManagementContext.Provider>
    );
}
