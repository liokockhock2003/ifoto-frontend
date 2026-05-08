import { useQuery } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
import {
    ReceiptDetailSchema,
    ReceiptListItemSchema,
    type ReceiptDetail,
    type ReceiptListItem,
} from '@/store/schemas/receipt';

// ── Query factory instance ────────────────────────────────────────────────────

const receiptQuery = QueryFactory<ReceiptDetail, unknown, never>(
    'receipt',
    {
        single: ReceiptDetailSchema,
        list: ReceiptListItemSchema.array() as never,
    },
    '/api/v1/receipts',
);

// ── Query configs ─────────────────────────────────────────────────────────────

const MY_RECEIPT_LIST_SUFFIX = 'my' as const;

// Current user's receipt list — GET /api/v1/receipts/my
const myReceiptsListQuery = receiptQuery.customList<ReceiptListItem[]>({
    responseSchema: ReceiptListItemSchema.array(),
    urlSuffix: '/my',
    queryKeySuffix: MY_RECEIPT_LIST_SUFFIX,
});

// ── Query keys ────────────────────────────────────────────────────────────────

export const receiptKeys = {
    all: receiptQuery.qk(),
    my: () => [...receiptQuery.qk(), MY_RECEIPT_LIST_SUFFIX] as const,
    detail: (receiptNumber: string) => [...receiptQuery.qk(), 'detail', receiptNumber] as const,
};

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useMyReceipts(options?: { refetchInterval?: number | false }) {
    return useQuery({
        ...myReceiptsListQuery(),
        refetchInterval: options?.refetchInterval ?? false,
    });
}

export function useReceiptDetail(receiptNumber: string) {
    return useQuery({
        ...receiptQuery.detail(receiptNumber),
        enabled: !!receiptNumber,
    });
}
