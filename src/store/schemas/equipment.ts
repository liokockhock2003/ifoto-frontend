import { z } from 'zod';

export const EquipmentStatusTypeSchema = z.enum([
    'UNAVAILABLE', 'MAINTENANCE', 'CONVOCATION', 'MRM', 'AVAILABLE', 'BOOKED', 'IN_USE', 'PARTIALLY_AVAILABLE',
]);

export const EquipmentDateStatusSchema = z.object({
    id: z.number().int(),
    statusType: EquipmentStatusTypeSchema,
    startDatetime: z.string(),
    endDatetime: z.string(),
    notes: z.string().nullable(),
});

export const EquipmentStatusPayloadSchema = z.object({
    statusType: EquipmentStatusTypeSchema.exclude(['AVAILABLE', 'BOOKED', 'IN_USE', 'PARTIALLY_AVAILABLE']),
    startDatetime: z.string(),
    endDatetime: z.string(),
    notes: z.string().optional(),
});

export const BoundaryNoteSchema = z.object({
    rentalId: z.number().int().nullable(),
    statusId: z.number().int().nullable(),
    availableAfter: z.string().nullable(),
    mustReturnBefore: z.string().nullable(),
});

export const SubBoundaryNoteSchema = z.object({
    rentalId: z.number().int().nullable(),
    holdId: z.number().int().nullable(),
    availableAfter: z.string().nullable(),
    mustReturnBefore: z.string().nullable(),
    quantity: z.number().int(),
});

export const MainEquipmentSchema = z.object({
    mainEquipmentId: z.number().int().nonnegative(),
    equipmentType: z.string(),
    lensType: z.string().nullish(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string().nullable(),
    condition: z.enum(['GOOD', 'FAIR', 'FAULTY']),
    status: EquipmentStatusTypeSchema,
    problems: z.string().nullable(),
    pricingCategoryId: z.number().int().nonnegative().nullish(),
    pricingCategory: z.string().nullish(),
    isForRent: z.boolean(),
    dateStatuses: z.array(EquipmentDateStatusSchema).optional(),
    boundaryNotes: z.array(BoundaryNoteSchema).optional(),
});

export const SubEquipmentQuantityHoldSchema = z.object({
    id: z.number().int(),
    quantity: z.number().int().positive(),
    startDatetime: z.string(),
    endDatetime: z.string(),
    notes: z.string().nullable(),
});

export const SubEquipmentQuantityHoldPayloadSchema = z.object({
    quantity: z.number().int().min(1),
    startDatetime: z.string(),
    endDatetime: z.string(),
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
    boundaryNotes: z.array(SubBoundaryNoteSchema).optional(),
    notes: z.string().nullable(),
    pricingCategoryId: z.number().int().nonnegative().nullable().optional(),
    pricingCategoryName: z.string().nullable().optional(),
    isForRent: z.boolean().optional(),
});

export const EquipmentListResponseSchema = z.object({
    mainEquipment: z.array(MainEquipmentSchema),
    subEquipment: z.array(SubEquipmentSchema),
});

// ── Equipment schedules (for a rental/request's assigned equipment) ────────────
// Upcoming status windows + quantity holds for the equipment of one rental/request.
// statusType is kept as a plain string — the endpoint may return values beyond the
// management enum (e.g. RESERVED); the UI maps known ones and falls back otherwise.
export const EquipmentScheduleStatusSchema = z.object({
    id: z.number().int(),
    statusType: z.string(),
    startDatetime: z.string(),
    endDatetime: z.string(),
    notes: z.string().nullable(),
});

export const EquipmentScheduleHoldSchema = z.object({
    id: z.number().int(),
    quantity: z.number().int(),
    startDatetime: z.string(),
    endDatetime: z.string(),
    notes: z.string().nullable(),
});

export const ScheduledMainEquipmentSchema = z.object({
    mainEquipmentId: z.number().int(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string().nullable(),
    statuses: z.array(EquipmentScheduleStatusSchema),
});

export const ScheduledSubEquipmentSchema = z.object({
    subEquipmentId: z.number().int(),
    type: z.string(),
    brand: z.string().nullable(),
    cameraModel: z.array(z.string()).optional(),
    borrowedQuantity: z.number().int(),
    holds: z.array(EquipmentScheduleHoldSchema),
});

export const EquipmentSchedulesResponseSchema = z.object({
    mainEquipment: z.array(ScheduledMainEquipmentSchema),
    subEquipment: z.array(ScheduledSubEquipmentSchema),
});

export type EquipmentScheduleStatus = z.infer<typeof EquipmentScheduleStatusSchema>;
export type EquipmentScheduleHold = z.infer<typeof EquipmentScheduleHoldSchema>;
export type ScheduledMainEquipment = z.infer<typeof ScheduledMainEquipmentSchema>;
export type ScheduledSubEquipment = z.infer<typeof ScheduledSubEquipmentSchema>;
export type EquipmentSchedulesResponse = z.infer<typeof EquipmentSchedulesResponseSchema>;

// Param for the rental/request equipment-schedules query. The equipment-id arrays
// override the stored set (live committee selection) AND are part of the cache key,
// so editing the selection auto-refetches.
export type EquipmentSchedulesParam = {
    id: number;
    mainEquipmentIds: number[];
    subEquipmentIds: number[];
};

export const EquipmentListFiltersSchema = z.object({});

export const AvailableEquipmentContextSchema = z.enum(['RENTAL', 'EVENT_REQUEST']);

export const AvailableEquipmentFiltersSchema = z.object({
    startDate: z.string(),
    endDate: z.string(),
    context: AvailableEquipmentContextSchema,
    // Excludes this rental's own holds so its assigned equipment shows as AVAILABLE
    // (pre-selectable). Backend default 0 = exclude nothing.
    excludeRentalId: z.number().int().positive().optional(),
    // Same as excludeRentalId but for an event-equipment request (context EVENT_REQUEST).
    excludeRequestId: z.number().int().positive().optional(),
});

// ── Payload schemas (no id — used for create & update request bodies) ─────────

export const MainEquipmentPayloadSchema = MainEquipmentSchema.omit({ mainEquipmentId: true, status: true, pricingCategoryId: true, pricingCategory: true, dateStatuses: true });
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
export type BoundaryNote = z.infer<typeof BoundaryNoteSchema>;
export type SubBoundaryNote = z.infer<typeof SubBoundaryNoteSchema>;
