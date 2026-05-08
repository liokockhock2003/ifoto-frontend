import { createContext, useContext } from 'react';

import type { Event } from '@/store/schemas/event';

export type EventManagementContextValue = {
    events: Event[];

    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
};

export const EventManagementContext = createContext<EventManagementContextValue | undefined>(
    undefined,
);

export function useEventManagementContext(): EventManagementContextValue {
    const context = useContext(EventManagementContext);
    if (!context) {
        throw new Error('useEventManagementContext must be used within <EventManagementProvider>');
    }
    return context;
}
