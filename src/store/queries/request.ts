import { useMutation, useQuery } from '@tanstack/react-query';
import { extractApiErrorMessage } from '@/utils/api-error';
import { QueryFactory } from '@/store/query-factory';
import { equipmentKeys } from '@/store/queries/equipment';
import {
    EquipmentSchedulesResponseSchema,
    type EquipmentSchedulesResponse,
    type EquipmentSchedulesParam,
} from '@/store/schemas/equipment';
import {
    EquipmentRequestSchema,
    PaginatedEquipmentRequestSchema,
    SubmitRequestPayloadSchema,
    type EquipmentRequest,
    type PaginatedEquipmentRequest,
    type RequestFilters,
    type SubmitRequestPayload,
    type ReviewRequestPayload,
    type UpdateRequestLogisticsPayload,
    type UpdateRequestEquipmentPayload,
} from '@/store/schemas/request';

const requestQuery = QueryFactory<EquipmentRequest>(
    'event-equipment-requests',
    {
        single: EquipmentRequestSchema,
        list: EquipmentRequestSchema.array(),
    },
    '/api/v1/event-equipment-requests',
);

// ── Query keys ────────────────────────────────────────────────────────────────

export const requestKeys = {
    all: requestQuery.qk(),
    list: () => requestQuery.lists(),
    byEvent: (eventId: number) => [...requestQuery.qk(), 'event', eventId],
    byEquipment: (id: number) => [...requestQuery.qk(), 'by-equipment', id],
    bySubEquipment: (id: number) => [...requestQuery.qk(), 'by-sub-equipment', id],
};

// ── Payload types with id ─────────────────────────────────────────────────────

type WithId<T> = T & { id: number };

// ── Query configs ─────────────────────────────────────────────────────────────

const allRequestsListQuery = requestQuery.customList<PaginatedEquipmentRequest>({
    responseSchema: PaginatedEquipmentRequestSchema,
    queryKeySuffix: 'list',
});

const requestsByEventQuery = requestQuery.customQuery<EquipmentRequest[], number>({
    responseSchema: EquipmentRequestSchema.array(),
    urlSuffix: (eventId) => `/event/${eventId}`,
    queryKeySuffix: (eventId) => ['event', eventId],
});

const requestsByEquipmentQuery = requestQuery.customQuery<EquipmentRequest[], number>({
    responseSchema: EquipmentRequestSchema.array(),
    urlSuffix: (equipmentId) => `/equipment/${equipmentId}`,
    queryKeySuffix: (equipmentId) => ['by-equipment', equipmentId],
});

const requestsBySubEquipmentQuery = requestQuery.customQuery<EquipmentRequest[], number>({
    responseSchema: EquipmentRequestSchema.array(),
    urlSuffix: (subEquipmentId) => `/sub-equipment/${subEquipmentId}`,
    queryKeySuffix: (subEquipmentId) => ['by-sub-equipment', subEquipmentId],
});

// Upcoming status windows + quantity holds for this request's equipment. The id arrays
// override the stored set (committee's live selection) and key the cache for reactivity.
const equipmentSchedulesQuery = requestQuery.customQuery<EquipmentSchedulesResponse, EquipmentSchedulesParam>({
    responseSchema: EquipmentSchedulesResponseSchema,
    urlSuffix: ({ id, mainEquipmentIds, subEquipmentIds }) => {
        const qs = new URLSearchParams();
        if (mainEquipmentIds.length) qs.set('mainEquipmentIds', mainEquipmentIds.join(','));
        if (subEquipmentIds.length) qs.set('subEquipmentIds', subEquipmentIds.join(','));
        const s = qs.toString();
        return `/${id}/equipment-schedules${s ? `?${s}` : ''}`;
    },
    queryKeySuffix: ({ id, mainEquipmentIds, subEquipmentIds }) =>
        ['equipment-schedules', id, mainEquipmentIds, subEquipmentIds],
});

// ── Mutation configs ──────────────────────────────────────────────────────────

const submitRequestMutation = requestQuery.customMutation<SubmitRequestPayload>({
    method: 'post',
    urlSuffix: '',
    inputSchema: SubmitRequestPayloadSchema,
    toastMsg: 'Request submitted',
    invalidateKeys: () => [requestKeys.all],
});

const cancelRequestMutation = requestQuery.customMutation<WithId<object>>({
    method: 'delete',
    urlSuffix: ({ id }) => `/${id}`,
    toastMsg: 'Request cancelled',
    invalidateKeys: () => [requestKeys.all],
});

const reviewRequestMutation = requestQuery.customMutation<WithId<ReviewRequestPayload>>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/review`,
    invalidateKeys: () => [requestKeys.all, [...equipmentKeys.available()]],
});

const markReturnedMutation = requestQuery.customMutation<WithId<object>>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/mark-returned`,
    invalidateKeys: () => [requestKeys.all],
});

const markPickedUpMutation = requestQuery.customMutation<WithId<object>>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/mark-picked-up`,
    invalidateKeys: () => [requestKeys.all],
});

const updateLogisticsMutation = requestQuery.customMutation<WithId<UpdateRequestLogisticsPayload>>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/logistics`,
    invalidateKeys: () => [requestKeys.all, [...equipmentKeys.available()]],
});

const updateRequestEquipmentMutation = requestQuery.customMutation<WithId<UpdateRequestEquipmentPayload>>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/equipment`,
    invalidateKeys: () => [requestKeys.all, [...equipmentKeys.available()]],
});

const triggerActiveMutation = requestQuery.customMutation<object>({
    method: 'post',
    urlSuffix: '/trigger-active',
    toastMsg: 'Active check triggered',
    invalidateKeys: () => [requestKeys.all],
});

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useAllRequests(filters?: RequestFilters) {
    return useQuery(allRequestsListQuery(filters));
}

export function useRequestsByEvent(eventId: number, options?: { enabled?: boolean }) {
    return useQuery(requestsByEventQuery(eventId, options));
}

export function useRequestsByEquipment(equipmentId: number, enabled = true) {
    return useQuery(requestsByEquipmentQuery(equipmentId, { enabled: enabled && equipmentId > 0 }));
}

export function useRequestsBySubEquipment(subEquipmentId: number, enabled = true) {
    return useQuery(requestsBySubEquipmentQuery(subEquipmentId, { enabled: enabled && subEquipmentId > 0 }));
}

export function useRequestEquipmentSchedules(param: EquipmentSchedulesParam, options?: { enabled?: boolean }) {
    return useQuery(equipmentSchedulesQuery(param, { enabled: (options?.enabled ?? true) && param.id > 0 }));
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useSubmitRequest() {
    return useMutation<EquipmentRequest, Error, SubmitRequestPayload>({
        ...submitRequestMutation,
        mutationFn: async (input) => {
            try {
                return await submitRequestMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useCancelRequest() {
    return useMutation<EquipmentRequest, Error, WithId<object>>({
        ...cancelRequestMutation,
        mutationFn: async (input) => {
            try {
                return await cancelRequestMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useReviewRequest() {
    return useMutation<EquipmentRequest, Error, WithId<ReviewRequestPayload>>({
        ...reviewRequestMutation,
        mutationFn: async (input) => {
            try {
                return await reviewRequestMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useMarkReturned() {
    return useMutation<EquipmentRequest, Error, WithId<object>>({
        ...markReturnedMutation,
        mutationFn: async (input) => {
            try {
                return await markReturnedMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useMarkPickedUp() {
    return useMutation<EquipmentRequest, Error, WithId<object>>({
        ...markPickedUpMutation,
        mutationFn: async (input) => {
            try {
                return await markPickedUpMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useUpdateRequestLogistics() {
    return useMutation<EquipmentRequest, Error, WithId<UpdateRequestLogisticsPayload>>({
        ...updateLogisticsMutation,
        mutationFn: async (input) => {
            try {
                return await updateLogisticsMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useUpdateRequestEquipment() {
    return useMutation<EquipmentRequest, Error, WithId<UpdateRequestEquipmentPayload>>({
        ...updateRequestEquipmentMutation,
        mutationFn: async (input) => {
            try {
                return await updateRequestEquipmentMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useTriggerActive() {
    return useMutation<EquipmentRequest, Error, object>({
        ...triggerActiveMutation,
        mutationFn: async (input) => {
            try {
                return await triggerActiveMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}
