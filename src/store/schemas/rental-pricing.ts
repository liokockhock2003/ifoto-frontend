import { z } from 'zod';

export const RentalPricingSchema = z.object({
    id: z.number().int().nonnegative(),
    pricingCategoryId: z.number().int().nonnegative(),
    category: z.string(),
    memberType: z.string(),
    rate1Day: z.number(),
    rate3Days: z.number(),
    ratePerDayExtra: z.number(),
    latePenaltyPerDay: z.number(),
});

export const RentalPricingUpdateItemSchema = z.object({
    category: z.string(),
    memberType: z.string(),
    rate1Day: z.number(),
    rate3Days: z.number(),
    ratePerDayExtra: z.number(),
    latePenaltyPerDay: z.number(),
});

export const RentalPricingBulkUpdatePayloadSchema = z.object({
    items: z.array(RentalPricingUpdateItemSchema),
});

export type RentalPricing = z.infer<typeof RentalPricingSchema>;
export type RentalPricingUpdateItem = z.infer<typeof RentalPricingUpdateItemSchema>;
export type RentalPricingBulkUpdatePayload = z.infer<typeof RentalPricingBulkUpdatePayloadSchema>;
