import { useMutation, useQuery } from '@tanstack/react-query';
import { extractApiErrorMessage } from '@/utils/api-error';
import { QueryFactory } from '@/store/query-factory';
import {
    EquipmentRequestSchema,
    PaginatedEquipmentRequestSchema,
    SubmitRequestPayloadSchema,
    type EquipmentRequest,
    type PaginatedEquipmentRequest,
    type RequestFilters,
    type SubmitRequestPayload,
    type ReviewRequestPayload,
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
    invalidateKeys: () => [requestKeys.all],
});

const markReturnedMutation = requestQuery.customMutation<WithId<object>>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/mark-returned`,
    invalidateKeys: () => [requestKeys.all],
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
