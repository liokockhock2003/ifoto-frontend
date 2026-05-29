import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { QueryFactory } from '@/store/query-factory';
import { axios } from '@/utils/axios-instance';
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

// ── Query configs ─────────────────────────────────────────────────────────────

const invoiceByRentalQuery = receiptQuery.customQuery<InvoiceDetail, number>({
    responseSchema: InvoiceDetailSchema,
    urlSuffix: (id) => `/invoice/rental/${id}`,
    queryKeySuffix: (id) => ['invoice', id],
});

const penaltyInvoiceByRentalQuery = receiptQuery.customQuery<InvoiceDetail, number>({
    responseSchema: InvoiceDetailSchema,
    urlSuffix: (id) => `/overdue-invoice/rental/${id}`,
    queryKeySuffix: (id) => ['penalty-invoice', id],
});

const receiptByRentalQuery = receiptQuery.customQuery<ReceiptDetail, number>({
    responseSchema: ReceiptDetailSchema,
    urlSuffix: (id) => `/receipt/rental/${id}`,
    queryKeySuffix: (id) => ['receipt', id],
});

const penaltyReceiptByRentalQuery = receiptQuery.customQuery<ReceiptDetail, number>({
    responseSchema: ReceiptDetailSchema,
    urlSuffix: (id) => `/overdue-receipt/rental/${id}`,
    queryKeySuffix: (id) => ['penalty-receipt', id],
});

// ── Query keys ────────────────────────────────────────────────────────────────

export const receiptKeys = {
    all: receiptQuery.qk(),
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useInvoice(rentalId: number | null) {
    return useQuery<InvoiceDetail | null>({
        queryKey: invoiceByRentalQuery(rentalId ?? 0).queryKey,
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/v1/receipts/invoice/rental/${rentalId}`);
                return InvoiceDetailSchema.parse(res.data);
            } catch (err) {
                if (isAxiosError(err) && err.response?.status === 404) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
    });
}

export function usePenaltyInvoice(rentalId: number | null) {
    return useQuery<InvoiceDetail | null>({
        queryKey: penaltyInvoiceByRentalQuery(rentalId ?? 0).queryKey,
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/v1/receipts/overdue-invoice/rental/${rentalId}`);
                return InvoiceDetailSchema.parse(res.data);
            } catch (err) {
                if (isAxiosError(err) && err.response?.status === 404) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
    });
}

export function useReceipt(rentalId: number | null, options?: { refetchInterval?: number | false }) {
    return useQuery<ReceiptDetail | null>({
        queryKey: receiptByRentalQuery(rentalId ?? 0).queryKey,
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/v1/receipts/receipt/rental/${rentalId}`);
                return ReceiptDetailSchema.parse(res.data);
            } catch (err) {
                if (isAxiosError(err) && err.response?.status === 404) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
        refetchInterval: options?.refetchInterval ?? false,
    });
}

export function usePenaltyReceipt(rentalId: number | null) {
    return useQuery<ReceiptDetail | null>({
        queryKey: penaltyReceiptByRentalQuery(rentalId ?? 0).queryKey,
        queryFn: async () => {
            try {
                const res = await axios.get(`/api/v1/receipts/overdue-receipt/rental/${rentalId}`);
                return ReceiptDetailSchema.parse(res.data);
            } catch (err) {
                if (isAxiosError(err) && err.response?.status === 404) return null;
                throw err;
            }
        },
        enabled: !!rentalId,
    });
}
