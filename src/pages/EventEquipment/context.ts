import { createContext, useContext } from 'react';
import type { EquipmentRequest } from '@/store/schemas/request';

export type RequestManagementContextValue = {
    // Full request list (fetched once) — the page tabs/search filter it client-side.
    allRequests: EquipmentRequest[];
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
    currentUsername?: string;
};

export const RequestManagementContext = createContext<RequestManagementContextValue | undefined>(undefined);

export function useRequestManagementContext(): RequestManagementContextValue {
    const ctx = useContext(RequestManagementContext);
    if (!ctx) throw new Error('useRequestManagementContext must be used within <RequestManagementProvider>');
    return ctx;
}
