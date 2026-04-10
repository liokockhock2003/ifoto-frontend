import { useMemo, type ReactNode } from 'react';

import { useEquipmentList } from '@/store/queries/equipment';

import { InventoryManagementContext } from './context';

type InventoryManagementProviderProps = {
    children: ReactNode;
};

export function InventoryManagementProvider({
    children,
}: InventoryManagementProviderProps) {
    const equipmentQuery = useEquipmentList();

    const value = useMemo(
        () => ({
            mainEquipment: equipmentQuery.data?.mainEquipment ?? [],
            subEquipment: equipmentQuery.data?.subEquipment ?? [],
            data: equipmentQuery.data,

            totalMainEquipment: equipmentQuery.data?.mainEquipment.length ?? 0,
            totalSubEquipment: equipmentQuery.data?.subEquipment.length ?? 0,

            isLoading: equipmentQuery.isLoading,
            isFetching: equipmentQuery.isFetching,
            isError: equipmentQuery.isError,
            error: equipmentQuery.error ?? null,
            refetch: equipmentQuery.refetch,
        }),
        [
            equipmentQuery.data,
            equipmentQuery.error,
            equipmentQuery.isError,
            equipmentQuery.isFetching,
            equipmentQuery.isLoading,
            equipmentQuery.refetch,
        ],
    );

    return (
        <InventoryManagementContext.Provider value={value}>
            {children}
        </InventoryManagementContext.Provider>
    );
}