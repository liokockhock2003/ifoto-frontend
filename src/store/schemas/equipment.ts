import { z } from 'zod';

export const EquipmentStatusTypeSchema = z.enum([
    'UNAVAILABLE', 'MAINTENANCE', 'CONVOCATION', 'MRM', 'AVAILABLE',
]);

export const EquipmentDateStatusSchema = z.object({
    id: z.number().int(),
    statusType: EquipmentStatusTypeSchema,
    startDate: z.string(),
    endDate: z.string(),
    notes: z.string().nullable(),
});

export const EquipmentStatusPayloadSchema = z.object({
    statusType: EquipmentStatusTypeSchema.exclude(['AVAILABLE']),
    startDate: z.string(),
    endDate: z.string(),
    notes: z.string().optional(),
});

export const MainEquipmentSchema = z.object({
    mainEquipmentId: z.number().int().nonnegative(),
    equipmentType: z.string(),
    lensType: z.string().nullish(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    condition: z.string(),
    notes: z.string().nullable(),
    pricingCategoryId: z.number().int().nonnegative().nullish(),
    pricingCategoryName: z.string().nullish(),
    isForRent: z.boolean(),
    dateStatuses: z.array(EquipmentDateStatusSchema).optional(),
});

export const SubEquipmentQuantityHoldSchema = z.object({
    id: z.number().int(),
    quantity: z.number().int().positive(),
    startDate: z.string(),
    endDate: z.string(),
    notes: z.string().nullable(),
});

export const SubEquipmentQuantityHoldPayloadSchema = z.object({
    quantity: z.number().int().min(1),
    startDate: z.string(),
    endDate: z.string(),
    notes: z.string().optional(),
});

export const SubEquipmentSchema = z.object({
    subEquipmentId: z.number().int().nonnegative(),
    type: z.string().optional(),
    equipmentType: z.string(),
    cameraModel: z.array(z.string()).optional(),
    brand: z.string().nullable(),
    capacity: z.number().int().nonnegative(),
    totalQuantity: z.number().int().nonnegative(),
    usedQuantity: z.number().int().nonnegative().optional(),
    committedQuantity: z.number().int().nonnegative(),
    availableQuantity: z.number().int().nonnegative(),
    adminHeldQuantity: z.number().int().nonnegative().optional(),
    quantityHolds: z.array(SubEquipmentQuantityHoldSchema).optional(),
    notes: z.string().nullable(),
    pricingCategoryId: z.number().int().nonnegative().nullable().optional(),
    pricingCategoryName: z.string().nullable().optional(),
    isForRent: z.boolean().optional(),
});

export const EquipmentListResponseSchema = z.object({
    mainEquipment: z.array(MainEquipmentSchema),
    subEquipment: z.array(SubEquipmentSchema),
});

export const EquipmentListFiltersSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

export const AvailableEquipmentContextSchema = z.enum(['RENTAL', 'EVENT_REQUEST']);

export const AvailableEquipmentFiltersSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    context: AvailableEquipmentContextSchema,
});

// ── Payload schemas (no id — used for create & update request bodies) ─────────

export const MainEquipmentPayloadSchema = MainEquipmentSchema.omit({ mainEquipmentId: true, pricingCategoryId: true, pricingCategoryName: true, dateStatuses: true });
export const MainEquipmentUpdatePayloadSchema = MainEquipmentPayloadSchema.extend({
    mainEquipmentId: z.number().int().positive(),
});

export const SubEquipmentPayloadSchema = SubEquipmentSchema.omit({
    subEquipmentId: true,
    usedQuantity: true,
    committedQuantity: true,
    availableQuantity: true,
    adminHeldQuantity: true,
    quantityHolds: true,
});
export const SubEquipmentUpdatePayloadSchema = SubEquipmentPayloadSchema.extend({
    subEquipmentId: z.number().int().positive(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type MainEquipment = z.infer<typeof MainEquipmentSchema>;
export type MainEquipmentPayload = z.infer<typeof MainEquipmentPayloadSchema>;
export type MainEquipmentUpdatePayload = z.infer<typeof MainEquipmentUpdatePayloadSchema>;

export type SubEquipment = z.infer<typeof SubEquipmentSchema>;
export type SubEquipmentPayload = z.infer<typeof SubEquipmentPayloadSchema>;
export type SubEquipmentUpdatePayload = z.infer<typeof SubEquipmentUpdatePayloadSchema>;

export type EquipmentListResponse = z.infer<typeof EquipmentListResponseSchema>;
export type EquipmentListFilters = z.infer<typeof EquipmentListFiltersSchema>;

export type EquipmentStatusType = z.infer<typeof EquipmentStatusTypeSchema>;
export type EquipmentDateStatus = z.infer<typeof EquipmentDateStatusSchema>;
export type EquipmentStatusPayload = z.infer<typeof EquipmentStatusPayloadSchema>;

export type AvailableEquipmentContext = z.infer<typeof AvailableEquipmentContextSchema>;
export type AvailableEquipmentFilters = z.infer<typeof AvailableEquipmentFiltersSchema>;

export type SubEquipmentQuantityHold = z.infer<typeof SubEquipmentQuantityHoldSchema>;
export type SubEquipmentQuantityHoldPayload = z.infer<typeof SubEquipmentQuantityHoldPayloadSchema>;
