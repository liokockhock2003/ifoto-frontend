import { z } from 'zod';

export const ReceiptListItemSchema = z.object({
    receiptNumber: z.string(),
    issuedAt: z.string(),
    rentalNumber: z.string(),
    totalAmount: z.number(),
    paymentType: z.string(),
});

export const ReceiptRenterSchema = z.object({
    username: z.string(),
    fullName: z.string(),
    email: z.string(),
});

export const ReceiptRentalItemSchema = z.object({
    equipmentType: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    pricingCategory: z.string(),
    rateApplied: z.number(),
    latePenalty: z.number(),
    itemTotal: z.number(),
});

export const ReceiptRentalSchema = z.object({
    rentalNumber: z.string(),
    approvedStartDate: z.string(),
    approvedEndDate: z.string(),
    durationDays: z.number(),
    totalBaseAmount: z.number(),
    totalPenaltyAmount: z.number(),
    totalAmount: z.number(),
    items: z.array(ReceiptRentalItemSchema),
});

export const ReceiptPaymentSchema = z.object({
    paymentType: z.string(),
    paidAt: z.string(),
    transactionId: z.string().nullable(),
    paymentChannel: z.string().nullable(),
});

export const ReceiptDetailSchema = z.object({
    receiptNumber: z.string(),
    issuedAt: z.string(),
    renter: ReceiptRenterSchema,
    rental: ReceiptRentalSchema,
    payment: ReceiptPaymentSchema,
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReceiptListItem = z.infer<typeof ReceiptListItemSchema>;
export type ReceiptRenter = z.infer<typeof ReceiptRenterSchema>;
export type ReceiptRentalItem = z.infer<typeof ReceiptRentalItemSchema>;
export type ReceiptRental = z.infer<typeof ReceiptRentalSchema>;
export type ReceiptPayment = z.infer<typeof ReceiptPaymentSchema>;
export type ReceiptDetail = z.infer<typeof ReceiptDetailSchema>;
