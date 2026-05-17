import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
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

// ── Query configs ─────────────────────────────────────────────────────────────

const RENTAL_LIST_QUERY_KEY_SUFFIX = 'list' as const;
const MY_RENTAL_LIST_QUERY_KEY_SUFFIX = 'my' as const;

// All rentals — for Equipment Committee (paginated)
const allRentalsListQuery = rentalQuery.customList<PaginatedRental>({
    responseSchema: PaginatedRentalSchema,
    queryKeySuffix: RENTAL_LIST_QUERY_KEY_SUFFIX,
});

// Current user's own rentals
const myOwnRentalsListQuery = rentalQuery.customList<Rental[]>({
    responseSchema: RentalSchema.array(),
    urlSuffix: '/my',
    queryKeySuffix: MY_RENTAL_LIST_QUERY_KEY_SUFFIX,
});

// ── Mutation configs ──────────────────────────────────────────────────────────

const createRentalMutation = rentalQuery.customMutation<CreateRentalPayload>({
    method: 'post',
    urlSuffix: '',
    inputSchema: CreateRentalPayloadSchema,
    responseSchema: RentalSchema,
    toastMsg: 'Rental request submitted successfully',
    invalidateKeys: () => [[...rentalKeys.list()]],
});

// ── Query keys ────────────────────────────────────────────────────────────────

export const rentalKeys = {
    all: rentalQuery.qk(),
    list: () => [...rentalQuery.qk(), RENTAL_LIST_QUERY_KEY_SUFFIX] as const,
    my: () => [...rentalQuery.qk(), MY_RENTAL_LIST_QUERY_KEY_SUFFIX] as const,
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useAllRentals(filters?: RentalFilters) {
    return useQuery(allRentalsListQuery(filters));
}

export function useMyOwnRentals() {
    return useQuery(myOwnRentalsListQuery());
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useCreateRental() {
    return useMutation<Rental, Error, CreateRentalPayload>({
        ...createRentalMutation,
        mutationFn: async (input) => {
            try {
                return await createRentalMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const payRentalMutationFn = rentalQuery.customMutation<{ id: number } & PaymentPayload>({
    method: 'post',
    urlSuffix: ({ id }: { id: number }) => `/${id}/pay`,
    responseSchema: PaymentResponseSchema as any,
}).mutationFn;

export function usePayRental() {
    const queryClient = useQueryClient();
    return useMutation<PaymentResponse, Error, { id: number } & PaymentPayload>({
        mutationFn: async (input) => {
            try {
                return (await payRentalMutationFn(input)) as unknown as PaymentResponse;
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rentalKeys.my() });
        },
    });
}

const cancelRentalMutationFn = rentalQuery.customMutation<{ id: number }>({
    method: 'delete',
    urlSuffix: ({ id }) => `/${id}`,
    responseSchema: RentalSchema,
}).mutationFn;

export function useCancelRental() {
    const queryClient = useQueryClient();
    return useMutation<Rental, Error, { id: number }>({
        mutationFn: async (input) => {
            try {
                return await cancelRentalMutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rentalKeys.my() });
        },
    });
}

const reviewRentalMutationFn = rentalQuery.customMutation<{ id: number } & ReviewRentalPayload>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/review`,
    responseSchema: RentalSchema,
}).mutationFn;

export function useReviewRental() {
    const queryClient = useQueryClient();
    return useMutation<Rental, Error, { id: number } & ReviewRentalPayload>({
        mutationFn: async (input) => {
            try {
                return await reviewRentalMutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rentalKeys.list() });
            queryClient.invalidateQueries({ queryKey: rentalKeys.my() });
        },
    });
}

const confirmCashMutationFn = rentalQuery.customMutation<{ id: number }>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/confirm-cash`,
    responseSchema: RentalSchema,
}).mutationFn;

export function useConfirmCashPayment() {
    const queryClient = useQueryClient();
    return useMutation<Rental, Error, { id: number }>({
        mutationFn: async (input) => {
            try {
                return await confirmCashMutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rentalKeys.list() });
            queryClient.invalidateQueries({ queryKey: rentalKeys.my() });
        },
    });
}

const markReturnedMutationFn = rentalQuery.customMutation<{ id: number }>({
    method: 'patch',
    urlSuffix: ({ id }) => `/${id}/mark-returned`,
    responseSchema: RentalSchema,
}).mutationFn;

export function useMarkReturned() {
    const queryClient = useQueryClient();
    return useMutation<Rental, Error, { id: number }>({
        mutationFn: async (input) => {
            try {
                return await markReturnedMutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: rentalKeys.list() });
            queryClient.invalidateQueries({ queryKey: rentalKeys.my() });
        },
    });
}
