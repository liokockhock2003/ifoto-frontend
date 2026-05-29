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
    EquipmentDateStatusSchema,
    SubEquipmentQuantityHoldSchema,
    type EquipmentListResponse,
    type AvailableEquipmentFilters,
    type MainEquipment,
    type MainEquipmentPayload,
    type MainEquipmentUpdatePayload,
    type SubEquipment,
    type SubEquipmentPayload,
    type SubEquipmentUpdatePayload,
    type EquipmentDateStatus,
    type EquipmentStatusPayload,
    type SubEquipmentQuantityHold,
    type SubEquipmentQuantityHoldPayload,
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
const AVAILABLE_EQUIPMENT_QUERY_KEY_SUFFIX = 'available' as const;

const equipmentListQuery = equipmentQuery.customList<EquipmentListResponse>({
    responseSchema: EquipmentListResponseSchema,
    queryKeySuffix: EQUIPMENT_LIST_QUERY_KEY_SUFFIX,
});

const availableEquipmentListQuery = equipmentQuery.customList<EquipmentListResponse>({
    responseSchema: EquipmentListResponseSchema,
    urlSuffix: '/available',
    queryKeySuffix: AVAILABLE_EQUIPMENT_QUERY_KEY_SUFFIX,
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

// ── Status payload types ──────────────────────────────────────────────────────

type CreateStatusPayload = EquipmentStatusPayload & { mainEquipmentId: number };
type UpdateStatusPayload = EquipmentStatusPayload & { mainEquipmentId: number; statusId: number };
type DeleteStatusPayload = { mainEquipmentId: number; statusId: number };

// ── Status query + mutation configs ──────────────────────────────────────────

const equipmentStatusListQuery = mainEquipmentQuery.customQuery<EquipmentDateStatus[], number>({
    responseSchema: EquipmentDateStatusSchema.array(),
    urlSuffix: (mainEquipmentId) => `/${mainEquipmentId}/statuses`,
    queryKeySuffix: (mainEquipmentId) => ['statuses', mainEquipmentId],
});

const createStatusMutation = mainEquipmentQuery.customMutation<CreateStatusPayload>({
    method: 'post',
    urlSuffix: (i) => `/${i.mainEquipmentId}/statuses`,
    responseSchema: z.any(),
    toastMsg: 'Status created',
    invalidateKeys: (_, i) => [
        [...mainEquipmentQuery.qk(), 'statuses', i.mainEquipmentId],
        [...equipmentKeys.list()],
    ],
});

const updateStatusMutation = mainEquipmentQuery.customMutation<UpdateStatusPayload>({
    method: 'put',
    urlSuffix: (i) => `/${i.mainEquipmentId}/statuses/${i.statusId}`,
    responseSchema: z.any(),
    toastMsg: 'Status updated',
    invalidateKeys: (_, i) => [
        [...mainEquipmentQuery.qk(), 'statuses', i.mainEquipmentId],
        [...equipmentKeys.list()],
    ],
});

const deleteStatusMutation = mainEquipmentQuery.customMutation<DeleteStatusPayload>({
    method: 'delete',
    urlSuffix: (i) => `/${i.mainEquipmentId}/statuses/${i.statusId}`,
    responseSchema: z.any(),
    toastMsg: 'Status deleted',
    invalidateKeys: (_, i) => [
        [...mainEquipmentQuery.qk(), 'statuses', i.mainEquipmentId],
        [...equipmentKeys.list()],
    ],
});

// ── Quantity hold payload types ───────────────────────────────────────────────

type CreateHoldPayload = SubEquipmentQuantityHoldPayload & { subEquipmentId: number };
type UpdateHoldPayload = SubEquipmentQuantityHoldPayload & { subEquipmentId: number; holdId: number };
type DeleteHoldPayload = { subEquipmentId: number; holdId: number };

// ── Quantity hold query + mutation configs ────────────────────────────────────

const subEquipmentHoldListQuery = subEquipmentQuery.customQuery<SubEquipmentQuantityHold[], number>({
    responseSchema: SubEquipmentQuantityHoldSchema.array(),
    urlSuffix: (subEquipmentId) => `/${subEquipmentId}/quantity-holds`,
    queryKeySuffix: (subEquipmentId) => ['quantity-holds', subEquipmentId],
});

const createHoldMutation = subEquipmentQuery.customMutation<CreateHoldPayload>({
    method: 'post',
    urlSuffix: (i) => `/${i.subEquipmentId}/quantity-holds`,
    responseSchema: z.any(),
    toastMsg: 'Schedule created',
    invalidateKeys: (_, i) => [
        [...subEquipmentQuery.qk(), 'quantity-holds', i.subEquipmentId],
        [...equipmentKeys.list()],
    ],
});

const updateHoldMutation = subEquipmentQuery.customMutation<UpdateHoldPayload>({
    method: 'put',
    urlSuffix: (i) => `/${i.subEquipmentId}/quantity-holds/${i.holdId}`,
    responseSchema: z.any(),
    toastMsg: 'Schedule updated',
    invalidateKeys: (_, i) => [
        [...subEquipmentQuery.qk(), 'quantity-holds', i.subEquipmentId],
        [...equipmentKeys.list()],
    ],
});

const deleteHoldMutation = subEquipmentQuery.customMutation<DeleteHoldPayload>({
    method: 'delete',
    urlSuffix: (i) => `/${i.subEquipmentId}/quantity-holds/${i.holdId}`,
    responseSchema: z.any(),
    toastMsg: 'Schedule deleted',
    invalidateKeys: (_, i) => [
        [...subEquipmentQuery.qk(), 'quantity-holds', i.subEquipmentId],
        [...equipmentKeys.list()],
    ],
});

// ── Query keys ────────────────────────────────────────────────────────────────

export const equipmentKeys = {
    all: equipmentQuery.qk(),
    list: () => [...equipmentQuery.qk(), EQUIPMENT_LIST_QUERY_KEY_SUFFIX] as const,
    available: () => [...equipmentQuery.qk(), AVAILABLE_EQUIPMENT_QUERY_KEY_SUFFIX] as const,
};

export const equipmentStatusKeys = {
    byEquipment: (mainEquipmentId: number) =>
        [...mainEquipmentQuery.qk(), mainEquipmentId, 'statuses'] as const,
};

export const subEquipmentHoldKeys = {
    byEquipment: (subEquipmentId: number) =>
        [...subEquipmentQuery.qk(), subEquipmentId, 'quantity-holds'] as const,
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useEquipmentList() {
    return useQuery(equipmentListQuery({}));
}

export function useAvailableEquipment(filters: AvailableEquipmentFilters) {
    return useQuery({
        ...availableEquipmentListQuery(filters),
        enabled: !!filters.startDate && !!filters.endDate,
    });
}

export function useEquipmentStatuses(mainEquipmentId: number) {
    return useQuery(equipmentStatusListQuery(mainEquipmentId, { enabled: mainEquipmentId > 0 }));
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

// ── Equipment status mutation hooks ───────────────────────────────────────────

export function useCreateEquipmentStatus() {
    return useMutation<EquipmentDateStatus, Error, CreateStatusPayload>({
        ...(createStatusMutation as unknown as UseMutationOptions<EquipmentDateStatus, Error, CreateStatusPayload>),
        mutationFn: async (input) => {
            try {
                return await createStatusMutation.mutationFn(input) as unknown as EquipmentDateStatus;
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useUpdateEquipmentStatus() {
    return useMutation<EquipmentDateStatus, Error, UpdateStatusPayload>({
        ...(updateStatusMutation as unknown as UseMutationOptions<EquipmentDateStatus, Error, UpdateStatusPayload>),
        mutationFn: async (input) => {
            try {
                return await updateStatusMutation.mutationFn(input) as unknown as EquipmentDateStatus;
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useDeleteEquipmentStatus() {
    return useMutation<void, Error, DeleteStatusPayload>({
        ...(deleteStatusMutation as unknown as UseMutationOptions<void, Error, DeleteStatusPayload>),
        mutationFn: async (input) => {
            try {
                await deleteStatusMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

// ── Sub equipment quantity hold hooks ─────────────────────────────────────────

export function useSubEquipmentQuantityHolds(subEquipmentId: number) {
    return useQuery(subEquipmentHoldListQuery(subEquipmentId, { enabled: subEquipmentId > 0 }));
}

export function useCreateQuantityHold() {
    return useMutation<SubEquipmentQuantityHold, Error, CreateHoldPayload>({
        ...(createHoldMutation as unknown as UseMutationOptions<SubEquipmentQuantityHold, Error, CreateHoldPayload>),
        mutationFn: async (input) => {
            try {
                return await createHoldMutation.mutationFn(input) as unknown as SubEquipmentQuantityHold;
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useUpdateQuantityHold() {
    return useMutation<SubEquipmentQuantityHold, Error, UpdateHoldPayload>({
        ...(updateHoldMutation as unknown as UseMutationOptions<SubEquipmentQuantityHold, Error, UpdateHoldPayload>),
        mutationFn: async (input) => {
            try {
                return await updateHoldMutation.mutationFn(input) as unknown as SubEquipmentQuantityHold;
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useDeleteQuantityHold() {
    return useMutation<void, Error, DeleteHoldPayload>({
        ...(deleteHoldMutation as unknown as UseMutationOptions<void, Error, DeleteHoldPayload>),
        mutationFn: async (input) => {
            try {
                await deleteHoldMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}
