import { toast } from 'sonner';
import { AlertTriangle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCancelRequest } from '@/store/queries/request';
import type { EquipmentRequest } from '@/store/schemas/request';

type EquipmentRequestCancelDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

export function EquipmentRequestCancelDialog({
    open,
    onOpenChange,
    request,
}: EquipmentRequestCancelDialogProps) {
    const mutation = useCancelRequest();

    async function handleCancel() {
        if (!request) return;
        try {
            await mutation.mutateAsync({ id: request.id });
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to cancel request');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Cancel Request
                    </DialogTitle>
                    <DialogDescription>
                        You are about to cancel{' '}
                        <span className="font-medium text-foreground">
                            {request?.requestNumber ?? '—'}
                        </span>
                        . This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <Button
                        className="text-muted-foreground"
                        type="button"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Keep Request
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!request || mutation.isPending}
                        onClick={() => void handleCancel()}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        {mutation.isPending ? 'Cancelling...' : 'Cancel Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
