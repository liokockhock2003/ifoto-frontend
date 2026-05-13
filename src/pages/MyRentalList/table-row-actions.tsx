import { useState } from 'react';
import { Eye, CreditCard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import type { Rental } from '@/store/schemas/rental';

import { RentalViewDialog } from './dialog-view';

type RentalRowActionsProps = {
    row: Row<Rental>;
};

export function RentalRowActions({ row }: RentalRowActionsProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const rental = row.original;

    const showPayNow = rental.status === 'APPROVED' || rental.status === 'PENDING_PAYMENT';
    const showPayPenalty = rental.status === 'RETURNED' && rental.totalPenaltyAmount > 0;

    return (
        <>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setOpen(true)}
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
                        Pay Now
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
            </div>

            <RentalViewDialog
                open={open}
                onOpenChange={setOpen}
                rental={rental}
            />
        </>
    );
}
