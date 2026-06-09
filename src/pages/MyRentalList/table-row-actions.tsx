import { useState } from 'react';
import { CreditCard, Eye, FileText, MoreHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

import { RentalViewDialog } from './dialog-view';
import { RentalDeleteDialog } from './dialog-delete';

type RentalRowActionsProps = {
    row: Row<Rental>;
};

export function RentalRowActions({ row }: RentalRowActionsProps) {
    const navigate = useNavigate();
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const rental = row.original;

    const showPayNow = rental.status === 'PICKED_UP' || rental.status === 'PENDING_PAYMENT';
    const showPayPenalty = rental.status === 'RETURNED' && rental.totalPenaltyAmount > 0 && rental.paymentStatus !== 'PENALTY_PAID';
    const showInvoice = rental.status !== 'PENDING_REVIEW';
    const showReceipt = (['PAID', 'ACTIVE', 'OVERDUE', 'RETURNED'] as const).includes(rental.status as 'PAID' | 'ACTIVE' | 'OVERDUE' | 'RETURNED');
    const showCancel = rental.status === 'PENDING_REVIEW' || rental.status === 'APPROVED';

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

                    {showInvoice && (
                        <DropdownMenuItem
                            onClick={() => navigate('/equipment-rent/new', { state: { rental } })}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            View Invoice
                        </DropdownMenuItem>
                    )}

                    {showReceipt && (
                        <DropdownMenuItem
                            onClick={() => navigate('/equipment-rent/new', { state: { rental, goToReceipt: true } })}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            View Receipt
                        </DropdownMenuItem>
                    )}

                    {(showPayNow || showPayPenalty) && <DropdownMenuSeparator />}

                    {showPayNow && (
                        <DropdownMenuItem
                            className="text-primary focus:text-primary"
                            onClick={() => navigate('/equipment-rent/new', { state: { rental } })}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Now
                        </DropdownMenuItem>
                    )}

                    {showPayPenalty && (
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => navigate('/equipment-rent/new', { state: { rental } })}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Penalty
                        </DropdownMenuItem>
                    )}

                    {showCancel && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteOpen(true)}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel Rental
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <RentalViewDialog
                open={viewOpen}
                onOpenChange={setViewOpen}
                rental={rental}
            />

            <RentalDeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                rental={rental}
            />
        </>
    );
}
