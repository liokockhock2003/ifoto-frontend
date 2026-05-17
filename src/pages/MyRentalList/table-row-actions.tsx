import { useState } from 'react';
import { Eye, CreditCard, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
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

    const showPayNow = rental.status === 'APPROVED' || rental.status === 'PENDING_PAYMENT';
    const showPayPenalty = rental.status === 'RETURNED' && rental.totalPenaltyAmount > 0 && rental.paymentStatus !== 'PENALTY_PAID';
    const showCancel = rental.status === 'PENDING_REVIEW';

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

                {showPayNow && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-primary border-primary hover:bg-primary/10"
                        onClick={() => navigate('/equipment-rent/new', { state: { rental } })}
                    >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Now
                    </Button>
                )}

                {showPayPenalty && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => navigate('/equipment-rent/new', { state: { rental } })}
                    >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Penalty
                    </Button>
                )}

                {rental.status !== 'PENDING_PAYMENT' && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground"
                        onClick={() => navigate('/equipment-rent/new', { state: { rental, goToReceipt: true } })}
                    >
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View receipt</span>
                    </Button>
                )}

                {showCancel && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cancel rental</span>
                    </Button>
                )}
            </div>

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
