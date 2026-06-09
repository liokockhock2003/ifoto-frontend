import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banknote, CheckSquare, Eye, MoreHorizontal, PackageCheck, RefreshCw, Truck } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { useAuth } from '@/store/auth-context';
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

import { BookingConfirmCashDialog } from './dialog-confirm-cash';
import { BookingMarkReturnedDialog } from './dialog-mark-returned';
import { BookingMarkPickedUpDialog } from './dialog-mark-picked-up';

type BookingRowActionsProps = {
    row: Row<Rental>;
};

export function BookingRowActions({ row }: BookingRowActionsProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [viewOpen, setViewOpen] = useState(false);
    const [confirmCashOpen, setConfirmCashOpen] = useState(false);
    const [markReturnedOpen, setMarkReturnedOpen] = useState(false);
    const [markPickedUpOpen, setMarkPickedUpOpen] = useState(false);

    const rental = row.original;

    // Review & update happen on the calendar-driven logistics page (mode derived from status).
    const openLogistics = () =>
        navigate(`/rental-management/calendar/${rental.id}`, {
            state: { breadcrumbLabel: rental.rentalNumber },
        });

    const isApprover = rental.reviewedByUsername === user?.username;
    const showReview = rental.status === 'PENDING_REVIEW';
    const showMarkPickedUp = isApprover && rental.status === 'APPROVED';
    const showUpdateLogistics = isApprover && (rental.status === 'APPROVED' || rental.status === 'PICKED_UP');
    const showUpdateEquipment = isApprover && rental.status === 'APPROVED';
    const showConfirmCash = rental.paymentStatus === 'CASH_PENDING' || rental.paymentStatus === 'BANK_TRANSFER_PENDING';
    const confirmLabel = rental.paymentMethod === 'BANK_TRANSFER' ? 'Confirm Bank Transfer' : 'Confirm Cash';
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
                                onClick={openLogistics}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Review Rental
                            </DropdownMenuItem>
                        </>
                    )}

                    {(showUpdateLogistics || showUpdateEquipment) && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={openLogistics}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Update Rental
                            </DropdownMenuItem>
                        </>
                    )}

                    {showMarkPickedUp && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-primary focus:text-primary"
                                onClick={() => setMarkPickedUpOpen(true)}
                            >
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Picked Up
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
                                {confirmLabel}
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
            <BookingConfirmCashDialog open={confirmCashOpen} onOpenChange={setConfirmCashOpen} rental={rental} />
            <BookingMarkReturnedDialog open={markReturnedOpen} onOpenChange={setMarkReturnedOpen} rental={rental} />
            <BookingMarkPickedUpDialog open={markPickedUpOpen} onOpenChange={setMarkPickedUpOpen} rental={rental} />
        </>
    );
}
