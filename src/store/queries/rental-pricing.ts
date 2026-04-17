import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';

import { QueryFactory } from '@/store/query-factory';
import {
    RentalPricingSchema,
    RentalPricingBulkUpdatePayloadSchema,
    type RentalPricing,
    type RentalPricingBulkUpdatePayload,
} from '@/store/schemas/rental-pricing';
import { extractApiErrorMessage } from '@/utils/api-error';

// ── Query factory ─────────────────────────────────────────────────────────────

const rentalPricingFactory = QueryFactory<RentalPricing>(
    'rental-pricing',
    {
        single: RentalPricingSchema,
        list: RentalPricingSchema.array(),
    },
    '/api/v1/rental-pricing',
);

// ── List query ────────────────────────────────────────────────────────────────

const rentalPricingListQuery = rentalPricingFactory.list();

// ── Bulk update mutation ──────────────────────────────────────────────────────

const bulkUpdateMutation = rentalPricingFactory.customMutation<RentalPricingBulkUpdatePayload>({
    method: 'put',
    urlSuffix: '/bulk',
    inputSchema: RentalPricingBulkUpdatePayloadSchema,
    responseSchema: z.any(),
    invalidateKeys: () => [[...rentalPricingKeys.list()]],
});

// ── Query keys ────────────────────────────────────────────────────────────────

export const rentalPricingKeys = {
    all: rentalPricingFactory.qk(),
    list: () => [...rentalPricingFactory.qk(), 'list'] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useRentalPricingList() {
    return useQuery(rentalPricingListQuery());
}

export function useBulkUpdateRentalPricing() {
    return useMutation<unknown, Error, RentalPricingBulkUpdatePayload>({
        ...(bulkUpdateMutation as unknown as UseMutationOptions<unknown, Error, RentalPricingBulkUpdatePayload>),
        mutationFn: async (input) => {
            try {
                return await bulkUpdateMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}
