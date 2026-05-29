import { Banknote } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useConfirmCashPayment } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

type BookingConfirmCashDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function BookingConfirmCashDialog({ open, onOpenChange, rental }: BookingConfirmCashDialogProps) {
    const confirmCashMutation = useConfirmCashPayment();

    async function handleConfirm() {
        if (!rental) return;
        try {
            await confirmCashMutation.mutateAsync({ id: rental.id });
            toast.success(`Cash payment confirmed for ${rental.rentalNumber}`);
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to confirm cash payment');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <Banknote className="h-5 w-5" />
                        Confirm Cash Payment
                    </DialogTitle>
                    <DialogDescription>
                        Confirm that the renter has paid cash in person for rental{' '}
                        <span className="font-medium text-foreground">{rental?.rentalNumber ?? '—'}</span>.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    This will mark the rental as <span className="font-medium text-foreground">PAID</span> and send a confirmation email and receipt to the renter.
                </p>

                <DialogFooter>
                    <Button
                        variant="outline"
                        className="text-muted-foreground"
                        disabled={confirmCashMutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!rental || confirmCashMutation.isPending}
                        onClick={() => void handleConfirm()}
                    >
                        <Banknote className="mr-2 h-4 w-4" />
                        {confirmCashMutation.isPending ? 'Confirming...' : 'Confirm Payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
