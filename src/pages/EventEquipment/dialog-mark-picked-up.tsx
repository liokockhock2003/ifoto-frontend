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
import { useMarkPickedUp } from '@/store/queries/request';
import type { EquipmentRequest } from '@/store/schemas/request';

type RequestMarkPickedUpDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

export function RequestMarkPickedUpDialog({ open, onOpenChange, request }: RequestMarkPickedUpDialogProps) {
    const markPickedUpMutation = useMarkPickedUp();

    async function handleConfirm() {
        if (!request) return;
        try {
            await markPickedUpMutation.mutateAsync({ id: request.id });
            toast.success(`Request ${request.requestNumber} marked as picked up`);
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to mark request as picked up');
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
                        Confirm that the equipment for request{' '}
                        <span className="font-medium text-foreground">{request?.requestNumber ?? '—'}</span> has been physically handed over.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    This records the physical handover. The request status is unchanged.
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
                        disabled={!request || markPickedUpMutation.isPending}
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
