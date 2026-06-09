import { useMutation, useQuery } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
import { invalidateQuery } from '@/store/query-client';
import { equipmentKeys } from '@/store/queries/equipment';
import {
    EquipmentSchedulesResponseSchema,
    type EquipmentSchedulesResponse,
    type EquipmentSchedulesParam,
} from '@/store/schemas/equipment';
import {
    RentalSchema,
    CreateRentalPayloadSchema,
    PaginatedRentalSchema,
    PaymentResponseSchema,
    type Rental,
    type CreateRentalPayload,
    type RentalFilters,
    type PaginatedRental,
    type ReviewRentalPayload,
    type PaymentPayload,
    type PaymentResponse,
    type UpdateLogisticsPayload,
    type UpdateEquipmentPayload,
} from '@/store/schemas/rental';
import { extractApiErrorMessage } from '@/utils/api-error';

// ── Query factory instance ────────────────────────────────────────────────────

const rentalQuery = QueryFactory<Rental, unknown, CreateRentalPayload>(
    'rental',
    {
        single: RentalSchema,
        list: RentalSchema.array(),
        payload: CreateRentalPayloadSchema,
    },
    '/api/v1/rentals',
);

// ── Query keys ────────────────────────────────────────────────────────────────

const RENTAL_LIST_QUERY_KEY_SUFFIX = 'list' as const;
const MY_RENTAL_LIST_QUERY_KEY_SUFFIX = 'my' as const;
const MY_APPROVALS_QUERY_KEY_SUFFIX = 'my-approvals' as const;

export const rentalKeys = {
    all: rentalQuery.qk(),
    list: () => [...rentalQuery.qk(), RENTAL_LIST_QUERY_KEY_SUFFIX] as const,
    my: () => [...rentalQuery.qk(), MY_RENTAL_LIST_QUERY_KEY_SUFFIX] as const,
    myApprovals: () => [...rentalQuery.qk(), MY_APPROVALS_QUERY_KEY_SUFFIX] as const,
    byEquipment: (id: number) => [...rentalQuery.qk(), 'by-equipment', id] as const,
    bySubEquipment: (id: number) => [...rentalQuery.qk(), 'by-sub-equipment', id] as const,
};

// ── Query configs ─────────────────────────────────────────────────────────────

const rentalsByEquipmentQuery = rentalQuery.customQuery<Rental[], number>({
    responseSchema: RentalSchema.array(),
    urlSuffix: (equipmentId) => `/equipment/${equipmentId}`,
    queryKeySuffix: (equipmentId) => ['by-equipment', equipmentId],
});

const rentalsBySubEquipmentQuery = rentalQuery.customQuery<Rental[], number>({
    responseSchema: RentalSchema.array(),
    urlSuffix: (subEquipmentId) => `/sub-equipment/${subEquipmentId}`,
    queryKeySuffix: (subEquipmentId) => ['by-sub-equipment', subEquipmentId],
});

// Upcoming status windows + quantity holds for this rental's equipment. The id arrays
// override the stored set (committee's live selection) and key the cache for reactivity.
const equipmentSchedulesQuery = rentalQuery.customQuery<EquipmentSchedulesResponse, EquipmentSchedulesParam>({
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

const allRentalsListQuery = rentalQuery.customList<PaginatedRental>({
    responseSchema: PaginatedRentalSchema,
    queryKeySuffix: RENTAL_LIST_QUERY_KEY_SUFFIX,
});

const myOwnRentalsListQuery = rentalQuery.customList<Rental[]>({
    responseSchema: RentalSchema.array(),
    urlSuffix: '/my',
    queryKeySuffix: MY_RENTAL_LIST_QUERY_KEY_SUFFIX,
});

const myApprovalsListQuery = rentalQuery.customList<Rental[]>({
    responseSchema: RentalSchema.array(),
    urlSuffix: '/my-approvals',
    queryKeySuffix: MY_APPROVALS_QUERY_KEY_SUFFIX,
});

// ── Mutation configs ──────────────────────────────────────────────────────────

const createRentalMutation = rentalQuery.customMutation<CreateRentalPayload>({
    method: 'post',
    urlSuffix: '',
    inputSchema: CreateRentalPayloadSchema,
    responseSchema: RentalSchema,
    toastMsg: 'Rental request submitted',
    invalidateKeys: () => [[...rentalKeys.list()], [...rentalKeys.my()]],
});

const payRentalMutationFn = rentalQuery.customMutation<{ id: number } & PaymentPayload>({
    method: 'post',
    urlSuffix: ({ id }) => `/${id}/pay`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    responseSchema: PaymentResponseSchema as any,
}).mutationFn;

const cancelRentalMutation = rentalQuery.customMutation<{ id: number }>({
    method: 'delete',
    urlSuffix: ({ id }) => `/${id}`,
    responseSchema: RentalSchema,
    invalidateKeys: () => [[...rentalKeys.my()], [...equipmentKeys.available()]],
});

const reviewRentalMutation = rentalQuery.customMutation<{ id: number } & ReviewRentalPayload>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/review`,
    responseSchema: RentalSchema,
    // Approving assigns equipment + sets a logistics window → availability changes.
    invalidateKeys: () => [[...rentalKeys.list()], [...rentalKeys.my()], [...equipmentKeys.available()]],
});

const confirmManualPaymentMutation = rentalQuery.customMutation<{ id: number }>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/confirm-manual-payment`,
    responseSchema: RentalSchema,
    invalidateKeys: () => [[...rentalKeys.list()], [...rentalKeys.my()]],
});

const markPickedUpMutation = rentalQuery.customMutation<{ id: number }>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/mark-picked-up`,
    responseSchema: RentalSchema,
    invalidateKeys: () => [[...rentalKeys.list()], [...rentalKeys.my()]],
});

const updateLogisticsMutation = rentalQuery.customMutation<{ id: number } & UpdateLogisticsPayload>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/logistics`,
    responseSchema: RentalSchema,
    // Shifting pickup/return changes the booked window → availability changes.
    invalidateKeys: () => [[...rentalKeys.list()], [...rentalKeys.my()], [...equipmentKeys.available()]],
});

const updateEquipmentMutation = rentalQuery.customMutation<{ id: number } & UpdateEquipmentPayload>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/equipment`,
    responseSchema: RentalSchema,
    // Swapping equipment frees/holds units → availability changes.
    invalidateKeys: () => [[...rentalKeys.list()], [...rentalKeys.my()], [...equipmentKeys.available()]],
});

const markReturnedMutation = rentalQuery.customMutation<{ id: number }>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/mark-returned`,
    responseSchema: RentalSchema,
    invalidateKeys: () => [[...rentalKeys.list()], [...rentalKeys.my()]],
});

// ── Error wrapper ─────────────────────────────────────────────────────────────

function withApiError<TInput, TOutput>(
    fn: (input: TInput) => Promise<TOutput>,
): (input: TInput) => Promise<TOutput> {
    return async (input) => {
        try {
            return await fn(input);
        } catch (err) {
            throw new Error(extractApiErrorMessage(err));
        }
    };
}

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useRentalsByEquipment(equipmentId: number, enabled = true) {
    return useQuery(rentalsByEquipmentQuery(equipmentId, { enabled: enabled && equipmentId > 0 }));
}

export function useRentalsBySubEquipment(subEquipmentId: number, enabled = true) {
    return useQuery(rentalsBySubEquipmentQuery(subEquipmentId, { enabled: enabled && subEquipmentId > 0 }));
}

export function useRentalEquipmentSchedules(param: EquipmentSchedulesParam, options?: { enabled?: boolean }) {
    return useQuery(equipmentSchedulesQuery(param, { enabled: (options?.enabled ?? true) && param.id > 0 }));
}

export function useAllRentals(filters?: RentalFilters) {
    return useQuery(allRentalsListQuery(filters));
}

export function useMyOwnRentals() {
    return useQuery(myOwnRentalsListQuery());
}

export function useMyApprovals() {
    return useQuery(myApprovalsListQuery());
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useCreateRental() {
    return useMutation<Rental, Error, CreateRentalPayload>({
        ...createRentalMutation,
        mutationFn: withApiError(createRentalMutation.mutationFn),
    });
}

export function usePayRental() {
    return useMutation<PaymentResponse, Error, { id: number } & PaymentPayload>({
        mutationFn: withApiError(async (input) => (await payRentalMutationFn(input)) as unknown as PaymentResponse),
        onSuccess: () => void invalidateQuery([...rentalKeys.my()]),
    });
}

export function useCancelRental() {
    return useMutation<Rental, Error, { id: number }>({
        ...cancelRentalMutation,
        mutationFn: withApiError(cancelRentalMutation.mutationFn),
    });
}

export function useReviewRental() {
    return useMutation<Rental, Error, { id: number } & ReviewRentalPayload>({
        ...reviewRentalMutation,
        mutationFn: withApiError(reviewRentalMutation.mutationFn),
    });
}

export function useConfirmManualPayment() {
    return useMutation<Rental, Error, { id: number }>({
        ...confirmManualPaymentMutation,
        mutationFn: withApiError(confirmManualPaymentMutation.mutationFn),
    });
}

export const useConfirmCashPayment = useConfirmManualPayment;

export function useMarkPickedUp() {
    return useMutation<Rental, Error, { id: number }>({
        ...markPickedUpMutation,
        mutationFn: withApiError(markPickedUpMutation.mutationFn),
    });
}

export function useUpdateLogistics() {
    return useMutation<Rental, Error, { id: number } & UpdateLogisticsPayload>({
        ...updateLogisticsMutation,
        mutationFn: withApiError(updateLogisticsMutation.mutationFn),
    });
}

export function useUpdateEquipment() {
    return useMutation<Rental, Error, { id: number } & UpdateEquipmentPayload>({
        ...updateEquipmentMutation,
        mutationFn: withApiError(updateEquipmentMutation.mutationFn),
    });
}

export function useMarkReturned() {
    return useMutation<Rental, Error, { id: number }>({
        ...markReturnedMutation,
        mutationFn: withApiError(markReturnedMutation.mutationFn),
    });
}
