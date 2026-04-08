import { useQuery } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
import {
    MainEquipmentSchema,
    EquipmentListResponseSchema,
    type EquipmentListResponse,
} from '@/store/schemas/equipment';

const EQUIPMENT_LIST_QUERY_KEY_SUFFIX = 'list' as const;

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
    queryKeySuffix: EQUIPMENT_LIST_QUERY_KEY_SUFFIX,
});

export const equipmentKeys = {
    all: equipmentQuery.qk(),
    list: () => [...equipmentQuery.qk(), EQUIPMENT_LIST_QUERY_KEY_SUFFIX] as const,
};

export function useEquipmentList() {
    return useQuery(equipmentListQuery());
}
