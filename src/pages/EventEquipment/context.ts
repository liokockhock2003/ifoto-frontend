import { createContext, useContext } from 'react';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import type { EquipmentRequest } from '@/store/schemas/request';

export type RequestManagementFilters = {
    status?: string;
    search?: string;
    page: number;
    size: number;
};

export const DEFAULT_REQUEST_FILTERS: RequestManagementFilters = {
    page: 0,
    size: 10,
};

export type RequestManagementContextValue = {
    filters: RequestManagementFilters;
    setStatus: (status?: string) => void;
    setSearch: (search?: string) => void;
    setPage: (page: number) => void;
    setFilters: (next: Partial<RequestManagementFilters>) => void;
    resetFilters: () => void;
    requests: EquipmentRequest[];
    totalElements: number;
    totalPages: number;
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
    reviewRequest: EquipmentRequest | null;
    setReviewRequest: (request: EquipmentRequest | null) => void;
    availableEquipment: MainEquipment[];
    availableSubEquipment: SubEquipment[];
    isAvailableEquipmentLoading: boolean;
};

export const RequestManagementContext = createContext<RequestManagementContextValue | undefined>(undefined);

export function useRequestManagementContext(): RequestManagementContextValue {
    const ctx = useContext(RequestManagementContext);
    if (!ctx) throw new Error('useRequestManagementContext must be used within <RequestManagementProvider>');
    return ctx;
}
