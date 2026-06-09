import { useQuery } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
import { isNotFoundError } from '@/utils/api-error';
import {
    InvoiceDetailSchema,
    ReceiptDetailSchema,
    type InvoiceDetail,
    type ReceiptDetail,
} from '@/store/schemas/receipt';

// ── Query factory instance ────────────────────────────────────────────────────

const receiptQuery = QueryFactory<ReceiptDetail, unknown, never>(
    'receipt',
    {
        single: ReceiptDetailSchema,
        list: ReceiptDetailSchema.array() as never,
    },
    '/api/v1/receipts',
);

// ── Query configs (exported — reused by hooks and use-rental-events) ──────────

export const invoiceByRentalQuery = receiptQuery.customQuery<InvoiceDetail, number>({
    responseSchema: InvoiceDetailSchema,
    urlSuffix: (id) => `/invoice/rental/${id}`,
    queryKeySuffix: (id) => ['invoice', id],
});

export const penaltyInvoiceByRentalQuery = receiptQuery.customQuery<InvoiceDetail, number>({
    responseSchema: InvoiceDetailSchema,
    urlSuffix: (id) => `/overdue-invoice/rental/${id}`,
    queryKeySuffix: (id) => ['penalty-invoice', id],
});

export const receiptByRentalQuery = receiptQuery.customQuery<ReceiptDetail, number>({
    responseSchema: ReceiptDetailSchema,
    urlSuffix: (id) => `/receipt/rental/${id}`,
    queryKeySuffix: (id) => ['receipt', id],
});

export const penaltyReceiptByRentalQuery = receiptQuery.customQuery<ReceiptDetail, number>({
    responseSchema: ReceiptDetailSchema,
    urlSuffix: (id) => `/overdue-receipt/rental/${id}`,
    queryKeySuffix: (id) => ['penalty-receipt', id],
});

// ── SSE stream config (exported — consumed by use-rental-events) ──────────────

export const rentalEventsStream = receiptQuery.customStream<number>({
    urlSuffix: (rentalId) => `/events/rental/${rentalId}`,
});

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useInvoice(rentalId: number | null) {
    const opts = invoiceByRentalQuery(rentalId ?? 0);
    return useQuery<InvoiceDetail | null>({
        queryKey: opts.queryKey,
        queryFn: async (ctx) => {
            try {
                return await opts.queryFn!(ctx as never);
            } catch (err) {
                if (isNotFoundError(err)) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
    });
}

export function usePenaltyInvoice(rentalId: number | null) {
    const opts = penaltyInvoiceByRentalQuery(rentalId ?? 0);
    return useQuery<InvoiceDetail | null>({
        queryKey: opts.queryKey,
        queryFn: async (ctx) => {
            try {
                return await opts.queryFn!(ctx as never);
            } catch (err) {
                if (isNotFoundError(err)) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
    });
}

export function useReceipt(rentalId: number | null) {
    const opts = receiptByRentalQuery(rentalId ?? 0);
    return useQuery<ReceiptDetail | null>({
        queryKey: opts.queryKey,
        queryFn: async (ctx) => {
            try {
                return await opts.queryFn!(ctx as never);
            } catch (err) {
                if (isNotFoundError(err)) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
    });
}

export function usePenaltyReceipt(rentalId: number | null) {
    const opts = penaltyReceiptByRentalQuery(rentalId ?? 0);
    return useQuery<ReceiptDetail | null>({
        queryKey: opts.queryKey,
        queryFn: async (ctx) => {
            try {
                return await opts.queryFn!(ctx as never);
            } catch (err) {
                if (isNotFoundError(err)) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
    });
}
