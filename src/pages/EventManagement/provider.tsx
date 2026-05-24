import { useMemo, type ReactNode } from 'react';

import { useAuth } from '@/store/auth-context';
import { useEvents, useMyEvents } from '@/store/queries/event';

import { EventManagementContext } from './context';

type EventManagementProviderProps = {
    children: ReactNode;
};

export function EventManagementProvider({ children }: EventManagementProviderProps) {
    const { hasRole } = useAuth();
    const isEventCommittee = hasRole('ROLE_EVENT_COMMITTEE');
    const allEventsQuery = useEvents();
    const myEventsQuery = useMyEvents();
    const eventsQuery = isEventCommittee ? myEventsQuery : allEventsQuery;

    const value = useMemo(
        () => ({
            events: eventsQuery.data ?? [],
            isEventCommittee,

            isLoading: eventsQuery.isLoading,
            isFetching: eventsQuery.isFetching,
            isError: eventsQuery.isError,
            error: eventsQuery.error ?? null,
            refetch: eventsQuery.refetch,
        }),
        [
            isEventCommittee,
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
