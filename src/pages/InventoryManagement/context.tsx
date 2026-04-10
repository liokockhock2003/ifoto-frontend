import { createContext, useContext } from 'react';

import type {
    EquipmentListResponse,
    MainEquipment,
    SubEquipment,
} from '@/store/schemas/equipment';

export type InventoryManagementContextValue = {
    mainEquipment: MainEquipment[];
    subEquipment: SubEquipment[];
    data?: EquipmentListResponse;

    totalMainEquipment: number;
    totalSubEquipment: number;

    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
};

export const InventoryManagementContext =
    createContext<InventoryManagementContextValue | undefined>(undefined);

export function useInventoryManagementContext(): InventoryManagementContextValue {
    const context = useContext(InventoryManagementContext);
    if (!context) {
        throw new Error(
            'useInventoryManagementContext must be used within <InventoryManagementProvider>',
        );
    }
    return context;
}