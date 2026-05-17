import { useState } from 'react';
import { Banknote, CheckSquare, Eye, PackageCheck } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import type { Rental } from '@/store/schemas/rental';
import { RentalViewDialog } from '@/pages/MyRentalList/dialog-view';

import { BookingReviewDialog } from './dialog-review';
import { BookingConfirmCashDialog } from './dialog-confirm-cash';
import { BookingMarkReturnedDialog } from './dialog-mark-returned';

type BookingRowActionsProps = {
    row: Row<Rental>;
};

export function BookingRowActions({ row }: BookingRowActionsProps) {
    const [viewOpen, setViewOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [confirmCashOpen, setConfirmCashOpen] = useState(false);
    const [markReturnedOpen, setMarkReturnedOpen] = useState(false);

    const rental = row.original;

    const showReview = rental.status === 'PENDING_REVIEW';
    const showConfirmCash = rental.paymentStatus === 'CASH_PENDING';
    const showMarkReturned = rental.status === 'ACTIVE' || rental.status === 'OVERDUE';

    return (
        <>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setViewOpen(true)}
                >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View rental details</span>
                </Button>

                {showReview && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setReviewOpen(true)}
                    >
                        <CheckSquare className="h-4 w-4" />
                        <span className="sr-only">Review rental</span>
                    </Button>
                )}

                {showConfirmCash && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-primary border-primary hover:bg-primary/10"
                        onClick={() => setConfirmCashOpen(true)}
                    >
                        <Banknote className="h-3.5 w-3.5" />
                        Confirm Cash
                    </Button>
                )}

                {showMarkReturned && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => setMarkReturnedOpen(true)}
                    >
                        <PackageCheck className="h-3.5 w-3.5" />
                        Mark Returned
                    </Button>
                )}
            </div>

            <RentalViewDialog open={viewOpen} onOpenChange={setViewOpen} rental={rental} />
            <BookingReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} rental={rental} />
            <BookingConfirmCashDialog open={confirmCashOpen} onOpenChange={setConfirmCashOpen} rental={rental} />
            <BookingMarkReturnedDialog open={markReturnedOpen} onOpenChange={setMarkReturnedOpen} rental={rental} />
        </>
    );
}
