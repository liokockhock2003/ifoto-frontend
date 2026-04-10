import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { QueryFactory } from '@/store/query-factory';
import {
    MainEquipmentSchema,
    MainEquipmentPayloadSchema,
    MainEquipmentUpdatePayloadSchema,
    SubEquipmentSchema,
    SubEquipmentPayloadSchema,
    SubEquipmentUpdatePayloadSchema,
    EquipmentListResponseSchema,
    type EquipmentListResponse,
    type MainEquipment,
    type MainEquipmentPayload,
    type MainEquipmentUpdatePayload,
    type SubEquipment,
    type SubEquipmentPayload,
    type SubEquipmentUpdatePayload,
} from '@/store/schemas/equipment';
import { extractApiErrorMessage } from '@/utils/api-error';

// ── Query factory instances ───────────────────────────────────────────────────

const equipmentQuery = QueryFactory(
    'equipment',
    {
        single: MainEquipmentSchema,
        list: MainEquipmentSchema.array(),
    },
    '/api/v1/equipment',
);

const mainEquipmentQuery = QueryFactory<MainEquipment, unknown, MainEquipmentPayload>(
    'equipment-main',
    {
        single: MainEquipmentSchema,
        list: MainEquipmentSchema.array(),
        payload: MainEquipmentPayloadSchema,
    },
    '/api/v1/equipment/main',
);

const subEquipmentQuery = QueryFactory<SubEquipment, unknown, SubEquipmentPayload>(
    'equipment-sub',
    {
        single: SubEquipmentSchema,
        list: SubEquipmentSchema.array(),
        payload: SubEquipmentPayloadSchema,
    },
    '/api/v1/equipment/sub',
);

// ── Delete payload schemas (id-only, defined inline like user.ts) ─────────────

const mainEquipmentDeletePayloadSchema = z.object({
    mainEquipmentId: z.number().int().positive(),
});
const subEquipmentDeletePayloadSchema = z.object({
    subEquipmentId: z.number().int().positive(),
});

type MainEquipmentDeletePayload = z.infer<typeof mainEquipmentDeletePayloadSchema>;
type SubEquipmentDeletePayload = z.infer<typeof subEquipmentDeletePayloadSchema>;

// ── List query ────────────────────────────────────────────────────────────────

const EQUIPMENT_LIST_QUERY_KEY_SUFFIX = 'list' as const;

const equipmentListQuery = equipmentQuery.customList<EquipmentListResponse>({
    responseSchema: EquipmentListResponseSchema,
    queryKeySuffix: EQUIPMENT_LIST_QUERY_KEY_SUFFIX,
});

// ── Mutation configs ──────────────────────────────────────────────────────────

const createMainEquipmentMutation = mainEquipmentQuery.customMutation<MainEquipmentPayload>({
    method: 'post',
    urlSuffix: '',
    inputSchema: MainEquipmentPayloadSchema,
    responseSchema: MainEquipmentSchema,
    invalidateKeys: () => [[...equipmentKeys.list()]],
});

const updateMainEquipmentMutation = mainEquipmentQuery.customMutation<MainEquipmentUpdatePayload>({
    method: 'put',
    urlSuffix: (input) => `/${input.mainEquipmentId}`,
    inputSchema: MainEquipmentUpdatePayloadSchema,
    responseSchema: MainEquipmentSchema,
    invalidateKeys: () => [[...equipmentKeys.list()]],
});

const deleteMainEquipmentMutation = mainEquipmentQuery.customMutation<MainEquipmentDeletePayload>({
    method: 'delete',
    urlSuffix: (input) => `/${input.mainEquipmentId}`,
    inputSchema: mainEquipmentDeletePayloadSchema,
    responseSchema: z.any(),  // server returns empty body on DELETE
    invalidateKeys: () => [[...equipmentKeys.list()]],
});

const createSubEquipmentMutation = subEquipmentQuery.customMutation<SubEquipmentPayload>({
    method: 'post',
    urlSuffix: '',
    inputSchema: SubEquipmentPayloadSchema,
    responseSchema: SubEquipmentSchema,
    invalidateKeys: () => [[...equipmentKeys.list()]],
});

const updateSubEquipmentMutation = subEquipmentQuery.customMutation<SubEquipmentUpdatePayload>({
    method: 'put',
    urlSuffix: (input) => `/${input.subEquipmentId}`,
    inputSchema: SubEquipmentUpdatePayloadSchema,
    responseSchema: SubEquipmentSchema,
    invalidateKeys: () => [[...equipmentKeys.list()]],
});

const deleteSubEquipmentMutation = subEquipmentQuery.customMutation<SubEquipmentDeletePayload>({
    method: 'delete',
    urlSuffix: (input) => `/${input.subEquipmentId}`,
    inputSchema: subEquipmentDeletePayloadSchema,
    responseSchema: z.any(),  // server returns empty body on DELETE
    invalidateKeys: () => [[...equipmentKeys.list()]],
});

// ── Query keys ────────────────────────────────────────────────────────────────

export const equipmentKeys = {
    all: equipmentQuery.qk(),
    list: () => [...equipmentQuery.qk(), EQUIPMENT_LIST_QUERY_KEY_SUFFIX] as const,
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useEquipmentList() {
    return useQuery(equipmentListQuery());
}

// ── Main equipment mutation hooks ─────────────────────────────────────────────

export function useCreateMainEquipment() {
    return useMutation<MainEquipment, Error, MainEquipmentPayload>({
        ...createMainEquipmentMutation,
        mutationFn: async (input) => {
            try {
                return await createMainEquipmentMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useUpdateMainEquipment() {
    return useMutation<MainEquipment, Error, MainEquipmentUpdatePayload>({
        ...updateMainEquipmentMutation,
        mutationFn: async (input) => {
            try {
                return await updateMainEquipmentMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useDeleteMainEquipment() {
    return useMutation<void, Error, MainEquipmentDeletePayload>({
        ...(deleteMainEquipmentMutation as unknown as UseMutationOptions<void, Error, MainEquipmentDeletePayload>),
        mutationFn: async (input) => {
            try {
                await deleteMainEquipmentMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

// ── Sub equipment mutation hooks ──────────────────────────────────────────────

export function useCreateSubEquipment() {
    return useMutation<SubEquipment, Error, SubEquipmentPayload>({
        ...createSubEquipmentMutation,
        mutationFn: async (input) => {
            try {
                return await createSubEquipmentMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useUpdateSubEquipment() {
    return useMutation<SubEquipment, Error, SubEquipmentUpdatePayload>({
        ...updateSubEquipmentMutation,
        mutationFn: async (input) => {
            try {
                return await updateSubEquipmentMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useDeleteSubEquipment() {
    return useMutation<void, Error, SubEquipmentDeletePayload>({
        ...(deleteSubEquipmentMutation as unknown as UseMutationOptions<void, Error, SubEquipmentDeletePayload>),
        mutationFn: async (input) => {
            try {
                await deleteSubEquipmentMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}
