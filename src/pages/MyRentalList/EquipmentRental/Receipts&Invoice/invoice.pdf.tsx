import type { InvoiceDetail } from '@/store/schemas/receipt';

import { DocumentPdfDocument } from './document-pdf';
import { invoiceToDoc } from './document-card';

export function InvoicePdfDocument({ invoice }: { invoice: InvoiceDetail }) {
    return <DocumentPdfDocument data={invoiceToDoc(invoice)} />;
}
