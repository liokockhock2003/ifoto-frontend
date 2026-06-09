import type { ReceiptDetail } from '@/store/schemas/receipt';

import { DocumentPdfDocument } from './document-pdf';
import { receiptToDoc } from './document-card';

export function ReceiptPdfDocument({ receipt, isPenalty }: { receipt: ReceiptDetail; isPenalty: boolean }) {
    return <DocumentPdfDocument data={receiptToDoc(receipt, isPenalty)} />;
}
