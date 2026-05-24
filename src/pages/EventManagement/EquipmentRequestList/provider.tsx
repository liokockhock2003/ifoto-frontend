import { useMemo, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { useRequestsByEvent } from '@/store/queries/request';

import { EquipmentRequestListContext } from './context';

type EquipmentRequestListProviderProps = {
    children: ReactNode;
};

export function EquipmentRequestListProvider({
    children,
}: EquipmentRequestListProviderProps) {
    const { eventId: eventIdParam } = useParams<{ eventId: string }>();
    const eventId = Number(eventIdParam ?? 0);

    const query = useRequestsByEvent(eventId, { enabled: eventId > 0 });

    const value = useMemo(
        () => ({
            requests: query.data ?? [],
            eventId,

            isLoading: query.isLoading,
            isFetching: query.isFetching,
            isError: query.isError,
            error: query.error ?? null,
            refetch: query.refetch,
        }),
        [
            eventId,
            query.data,
            query.error,
            query.isError,
            query.isFetching,
            query.isLoading,
            query.refetch,
        ],
    );

    return (
        <EquipmentRequestListContext.Provider value={value}>
            {children}
        </EquipmentRequestListContext.Provider>
    );
}
