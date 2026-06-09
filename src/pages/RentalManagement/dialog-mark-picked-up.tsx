import { Truck } from 'lucide-react';
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
import { useMarkPickedUp } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

type BookingMarkPickedUpDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function BookingMarkPickedUpDialog({ open, onOpenChange, rental }: BookingMarkPickedUpDialogProps) {
    const markPickedUpMutation = useMarkPickedUp();

    async function handleConfirm() {
        if (!rental) return;
        try {
            await markPickedUpMutation.mutateAsync({ id: rental.id });
            toast.success(`Rental ${rental.rentalNumber} marked as picked up`);
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to mark rental as picked up');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <Truck className="h-5 w-5" />
                        Mark Equipment Picked Up
                    </DialogTitle>
                    <DialogDescription>
                        Confirm that the equipment for rental{' '}
                        <span className="font-medium text-foreground">{rental?.rentalNumber ?? '—'}</span> has been physically handed over to the renter.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    The renter will receive an email notification and can proceed to payment after pickup is confirmed.
                </p>

                <DialogFooter>
                    <Button
                        variant="outline"
                        className="text-muted-foreground"
                        disabled={markPickedUpMutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!rental || markPickedUpMutation.isPending}
                        onClick={() => void handleConfirm()}
                    >
                        <Truck className="mr-2 h-4 w-4" />
                        {markPickedUpMutation.isPending ? 'Updating...' : 'Mark as Picked Up'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
