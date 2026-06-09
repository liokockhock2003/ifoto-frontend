import { Receipt } from 'lucide-react';

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

import { InvoiceView } from '../Receipts&Invoice/invoice-view';

export function GeneratedInvoice({ rentalId }: { rentalId: number | null }) {
    if (!rentalId) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Receipt />
                    </EmptyMedia>
                    <EmptyTitle>No rental found</EmptyTitle>
                </EmptyHeader>
            </Empty>
        );
    }

    return <InvoiceView rentalId={rentalId} />;
}
