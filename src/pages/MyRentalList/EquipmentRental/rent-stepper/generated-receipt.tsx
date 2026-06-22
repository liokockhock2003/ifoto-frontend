import { Receipt } from 'lucide-react';

import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

import { ReceiptView } from '../Receipts&Invoice/receipt-view';

export function GeneratedReceipt({
    rentalId,
    onBack: _onBack,
}: {
    rentalId: number | null;
    onBack: () => void;
}) {
    return (
        <div className="space-y-4">
            {rentalId
                ? <ReceiptView rentalId={rentalId} />
                : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Receipt />
                            </EmptyMedia>
                            <EmptyTitle>No rental linked to this receipt</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                )
            }
        </div>
    );
}
