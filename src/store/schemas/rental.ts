import { z } from 'zod';

export const SubEquipmentEntrySchema = z.object({
    subEquipmentId: z.number().int().positive(),
    quantity: z.number().int().positive(),
});

export const CreateRentalPayloadSchema = z.object({
    equipmentIds: z.array(z.number().int().positive()),
    startDate: z.string(),
    endDate: z.string(),
    notes: z.string(),
    subEquipmentEntries: z.array(SubEquipmentEntrySchema).optional(),
});

export const RentalSubItemSchema = z.object({
    id: z.number(),
    subEquipmentId: z.number(),
    equipmentType: z.string(),
    brand: z.string().nullable(),
    quantity: z.number().optional(),
    baseAmount: z.number().optional(),
    latePenaltyAmount: z.number().optional(),
    itemTotalAmount: z.number().optional(),
});

export const RentalItemSchema = z.object({
    id: z.number(),
    mainEquipmentId: z.number(),
    equipmentType: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    pricingCategory: z.string().nullable().optional(),
    baseAmount: z.number(),
    latePenaltyAmount: z.number(),
    itemTotalAmount: z.number(),
});

export const RentalSchema = z.object({
    id: z.number(),
    rentalNumber: z.string(),
    renterUsername: z.string(),
    status: z.string(),
    paymentMethod: z.string(),
    paymentStatus: z.string(),
    requestedStartDate: z.string(),
    requestedEndDate: z.string(),
    approvedStartDate: z.string().nullable(),
    approvedEndDate: z.string().nullable(),
    durationDays: z.number().nullable(),
    totalBaseAmount: z.number(),
    totalPenaltyAmount: z.number(),
    totalAmount: z.number(),
    rejectionReason: z.string().nullable(),
    committeeNotes: z.string().nullable(),
    renterNotes: z.string().nullable(),
    items: z.array(RentalItemSchema),
    subItems: z.array(RentalSubItemSchema).optional(),
    createdAt: z.string(),
});

const ApproveRentalPayloadSchema = z.object({
    action: z.literal('APPROVE'),
    approvedStartDate: z.string(),
    approvedEndDate: z.string(),
    equipmentIds: z.array(z.number().int().positive()).optional(),
    committeeNotes: z.string().optional(),
});

const RejectRentalPayloadSchema = z.object({
    action: z.literal('REJECT'),
    rejectionReason: z.string(),
    committeeNotes: z.string().optional(),
});

export const ReviewRentalPayloadSchema = z.discriminatedUnion('action', [
    ApproveRentalPayloadSchema,
    RejectRentalPayloadSchema,
]);

export const PaymentPayloadSchema = z.object({
    paymentMethod: z.enum(['ONLINE', 'CASH']),
});

export const PaymentResponseSchema = z.object({
    paymentId: z.number().optional(),
    paymentMethod: z.string().optional(),
    status: z.string(),
    totalAmount: z.number().optional(),
    billUrl: z.string().nullable(),
    billId: z.string().nullable().optional(),
    message: z.string(),
});

export const RentalFiltersSchema = z.object({
    status: z.string().optional(),
    search: z.string().optional(),
    page: z.number().int().min(0).optional(),
    size: z.number().int().positive().optional(),
});

export const PaginatedRentalSchema = z.object({
    content: z.array(RentalSchema),
    totalElements: z.number(),
    totalPages: z.number(),
    number: z.number(),
    size: z.number(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
    numberOfElements: z.number(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type SubEquipmentEntry = z.infer<typeof SubEquipmentEntrySchema>;
export type CreateRentalPayload = z.infer<typeof CreateRentalPayloadSchema>;
export type RentalItem = z.infer<typeof RentalItemSchema>;
export type RentalSubItem = z.infer<typeof RentalSubItemSchema>;
export type Rental = z.infer<typeof RentalSchema>;
export type RentalFilters = z.infer<typeof RentalFiltersSchema>;
export type PaginatedRental = z.infer<typeof PaginatedRentalSchema>;
export type ReviewRentalPayload = z.infer<typeof ReviewRentalPayloadSchema>;
export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
