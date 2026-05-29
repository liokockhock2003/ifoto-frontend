import { useState } from 'react';
import { Banknote, CheckSquare, Eye, MoreHorizontal, PackageCheck } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setViewOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>

                    {showReview && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-primary focus:text-primary"
                                onClick={() => setReviewOpen(true)}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Review Rental
                            </DropdownMenuItem>
                        </>
                    )}

                    {showConfirmCash && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-primary focus:text-primary"
                                onClick={() => setConfirmCashOpen(true)}
                            >
                                <Banknote className="mr-2 h-4 w-4" />
                                Confirm Cash
                            </DropdownMenuItem>
                        </>
                    )}

                    {showMarkReturned && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setMarkReturnedOpen(true)}>
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Mark Returned
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <RentalViewDialog open={viewOpen} onOpenChange={setViewOpen} rental={rental} />
            <BookingReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} rental={rental} />
            <BookingConfirmCashDialog open={confirmCashOpen} onOpenChange={setConfirmCashOpen} rental={rental} />
            <BookingMarkReturnedDialog open={markReturnedOpen} onOpenChange={setMarkReturnedOpen} rental={rental} />
        </>
    );
}
