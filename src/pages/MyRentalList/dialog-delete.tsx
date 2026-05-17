import { AlertTriangle, Trash2 } from 'lucide-react';
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
import { useCancelRental } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

type RentalDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function RentalDeleteDialog({ open, onOpenChange, rental }: RentalDeleteDialogProps) {
    const cancelRentalMutation = useCancelRental();

    async function handleCancel() {
        if (!rental) return;
        try {
            await cancelRentalMutation.mutateAsync({ id: rental.id });
            toast.success(`Rental ${rental.rentalNumber} cancelled`);
            onOpenChange(false);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to cancel rental';
            toast.error(message);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Cancel Rental Request
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. You are about to cancel rental{' '}
                        <span className="font-medium text-foreground">{rental?.rentalNumber ?? '—'}</span>.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Only rentals in <span className="font-medium text-foreground">Pending Review</span> status can be cancelled.
                </p>

                <DialogFooter>
                    <Button
                        className="text-muted-foreground"
                        type="button"
                        variant="outline"
                        disabled={cancelRentalMutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Keep Rental
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!rental || cancelRentalMutation.isPending}
                        onClick={() => void handleCancel()}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {cancelRentalMutation.isPending ? 'Cancelling...' : 'Cancel Rental'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
