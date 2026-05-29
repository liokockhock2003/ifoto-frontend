import { PackageCheck } from 'lucide-react';
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
import { useMarkReturned } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

type BookingMarkReturnedDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function BookingMarkReturnedDialog({ open, onOpenChange, rental }: BookingMarkReturnedDialogProps) {
    const markReturnedMutation = useMarkReturned();

    async function handleConfirm() {
        if (!rental) return;
        try {
            await markReturnedMutation.mutateAsync({ id: rental.id });
            toast.success(`Rental ${rental.rentalNumber} marked as returned`);
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to mark rental as returned');
        }
    }

    const isOverdue = rental?.status === 'OVERDUE';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <PackageCheck className="h-5 w-5" />
                        Mark Equipment Returned
                    </DialogTitle>
                    <DialogDescription>
                        Confirm that the equipment for rental{' '}
                        <span className="font-medium text-foreground">{rental?.rentalNumber ?? '—'}</span> has been physically returned.
                    </DialogDescription>
                </DialogHeader>

                {isOverdue && (
                    <p className="text-sm text-destructive">
                        This rental is <span className="font-semibold">overdue</span>. A late penalty will be calculated automatically and the renter will need to settle it before the rental is closed.
                    </p>
                )}

                {!isOverdue && (
                    <p className="text-sm text-muted-foreground">
                        The rental was returned on time. No penalty will be applied.
                    </p>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        className="text-muted-foreground"
                        disabled={markReturnedMutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={!rental || markReturnedMutation.isPending}
                        onClick={() => void handleConfirm()}
                    >
                        <PackageCheck className="mr-2 h-4 w-4" />
                        {markReturnedMutation.isPending ? 'Updating...' : 'Mark as Returned'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
