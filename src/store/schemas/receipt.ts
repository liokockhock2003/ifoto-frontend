import { z } from 'zod';

export const ReceiptRenterSchema = z.object({
    username: z.string(),
    fullName: z.string(),
    email: z.string(),
    phoneNumber: z.string().nullable(),
});

export const ReceiptRentalItemSchema = z.object({
    equipmentType: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    baseAmount: z.number(),
    penaltyAmount: z.number(),
    itemTotal: z.number(),
});

export const ReceiptRentalSubItemSchema = z.object({
    type: z.string(),
    equipmentType: z.string(),
    brand: z.string().nullable(),
    borrowedQuantity: z.number(),
    baseAmount: z.number(),
    penaltyAmount: z.number(),
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
    subItems: z.array(ReceiptRentalSubItemSchema).optional(),
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

export const InvoiceDetailSchema = z.object({
    invoiceNumber: z.string(),
    documentType: z.enum(['INVOICE', 'OVERDUE_INVOICE']),
    issuedAt: z.string(),
    renter: ReceiptRenterSchema,
    rental: ReceiptRentalSchema,
});

// ── SSE event ─────────────────────────────────────────────────────────────────

export const RentalEventSchema = z.object({
    documentType: z.enum(['INVOICE', 'RECEIPT', 'OVERDUE_INVOICE', 'OVERDUE_RECEIPT']),
    receiptNumber: z.string(),
    rentalId: z.number(),
});

export type RentalEvent = z.infer<typeof RentalEventSchema>;

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReceiptRenter = z.infer<typeof ReceiptRenterSchema>;
export type ReceiptRentalItem = z.infer<typeof ReceiptRentalItemSchema>;
export type ReceiptRentalSubItem = z.infer<typeof ReceiptRentalSubItemSchema>;
export type ReceiptRental = z.infer<typeof ReceiptRentalSchema>;
export type ReceiptPayment = z.infer<typeof ReceiptPaymentSchema>;
export type ReceiptDetail = z.infer<typeof ReceiptDetailSchema>;
export type InvoiceDetail = z.infer<typeof InvoiceDetailSchema>;
