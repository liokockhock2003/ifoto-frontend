import { useQuery } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
import {
    MainEquipmentSchema,
    EquipmentListResponseSchema,
    type EquipmentListResponse,
} from '@/store/schemas/equipment';

const equipmentQuery = QueryFactory(
    'equipment',
    {
        single: MainEquipmentSchema,
        list: MainEquipmentSchema.array(),
    },
    '/api/v1/equipment',
);

const equipmentListQuery = equipmentQuery.customList<EquipmentListResponse>({
    responseSchema: EquipmentListResponseSchema,
    queryKeySuffix: 'list',
});

export const equipmentKeys = {
    all: equipmentQuery.qk(),
    list: () => [...equipmentQuery.qk(), 'list'] as const,
};

export function useEquipmentList() {
    return useQuery(equipmentListQuery());
}
