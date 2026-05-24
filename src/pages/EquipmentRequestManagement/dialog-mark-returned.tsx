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
import { useMarkReturned } from '@/store/queries/request';
import type { EquipmentRequest } from '@/store/schemas/request';

type RequestMarkReturnedDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

export function RequestMarkReturnedDialog({ open, onOpenChange, request }: RequestMarkReturnedDialogProps) {
    const markReturnedMutation = useMarkReturned();

    async function handleConfirm() {
        if (!request) return;
        try {
            await markReturnedMutation.mutateAsync({ id: request.id });
            toast.success(`Request ${request.requestNumber} marked as returned`);
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to mark request as returned');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <PackageCheck className="h-5 w-5" />
                        Mark Equipment Returned
                    </DialogTitle>
                    <DialogDescription>
                        Confirm that all equipment for request{' '}
                        <span className="font-medium text-foreground">{request?.requestNumber ?? '—'}</span> has been physically returned.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                    Once marked as returned, the equipment will be released back to inventory.
                </p>

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
                        disabled={!request || markReturnedMutation.isPending}
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
