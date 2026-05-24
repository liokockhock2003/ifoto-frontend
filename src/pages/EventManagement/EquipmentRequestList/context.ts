import { createContext, useContext } from 'react';

import type { EquipmentRequest } from '@/store/schemas/request';

export type EquipmentRequestListContextValue = {
    requests: EquipmentRequest[];
    eventId: number;

    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
};

export const EquipmentRequestListContext = createContext<
    EquipmentRequestListContextValue | undefined
>(undefined);

export function useEquipmentRequestListContext(): EquipmentRequestListContextValue {
    const context = useContext(EquipmentRequestListContext);
    if (!context) {
        throw new Error(
            'useEquipmentRequestListContext must be used within <EquipmentRequestListProvider>',
        );
    }
    return context;
}
