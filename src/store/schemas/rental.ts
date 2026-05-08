import { z } from 'zod';

export const CreateRentalPayloadSchema = z.object({
    equipmentIds: z.array(z.number().int().positive()),
    startDate: z.string(),
    endDate: z.string(),
    notes: z.string(),
});

export const RentalItemSchema = z.object({
    id: z.number(),
    mainEquipmentId: z.number(),
    equipmentType: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    pricingCategory: z.string(),
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
    createdAt: z.string(),
});

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

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateRentalPayload = z.infer<typeof CreateRentalPayloadSchema>;
export type RentalItem = z.infer<typeof RentalItemSchema>;
export type Rental = z.infer<typeof RentalSchema>;
export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;
export type PaymentResponse = z.infer<typeof PaymentResponseSchema>;
