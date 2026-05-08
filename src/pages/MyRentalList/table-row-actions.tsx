import { useState } from 'react';
import { Eye, CreditCard, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Rental } from '@/store/schemas/rental';
import { usePayRental } from '@/store/queries/rental';

import { RentalViewDialog } from './dialog-view';

type RentalRowActionsProps = {
    row: Row<Rental>;
};

export function RentalRowActions({ row }: RentalRowActionsProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [penaltyOpen, setPenaltyOpen] = useState(false);
    const rental = row.original;
    const payRental = usePayRental();

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

                {rental.status === 'APPROVED' && (
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
                        onClick={() => setPenaltyOpen(true)}
                    >
                        <CreditCard className="h-3.5 w-3.5" />
                        Pay Penalty
                    </Button>
                )}

                {true && (
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

            <Dialog open={penaltyOpen} onOpenChange={setPenaltyOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Pay Overdue Penalty</DialogTitle>
                        <DialogDescription>
                            An overdue penalty of{' '}
                            <span className="font-semibold text-destructive">
                                RM {(rental.totalPenaltyAmount / 100).toFixed(2)}
                            </span>{' '}
                            is outstanding for rental <span className="font-mono">{rental.rentalNumber}</span>. Choose a payment method to proceed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={payRental.isPending}
                            onClick={() => payRental.mutate(
                                { id: rental.id, paymentMethod: 'CASH' },
                                { onSuccess: () => setPenaltyOpen(false) }
                            )}
                        >
                            Pay Cash
                        </Button>
                        <Button
                            className="flex-1"
                            disabled={payRental.isPending}
                            onClick={() => payRental.mutate(
                                { id: rental.id, paymentMethod: 'ONLINE' },
                                { onSuccess: () => setPenaltyOpen(false) }
                            )}
                        >
                            Pay Online
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
