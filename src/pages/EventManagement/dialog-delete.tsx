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
import { useDeleteEvent } from '@/store/queries/event';
import type { Event } from '@/store/schemas/event';

type EventDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Event | null;
};

export function EventDeleteDialog({ open, onOpenChange, event }: EventDeleteDialogProps) {
    const mutation = useDeleteEvent();

    async function handleDelete() {
        if (!event) return;
        try {
            await mutation.mutateAsync({ id: event.eventId });
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete event');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Deletion
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. You are about to permanently delete{' '}
                        <span className="font-medium text-foreground">{event?.eventName ?? '—'}</span>.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">Please confirm you want to continue.</p>

                <DialogFooter>
                    <Button
                        className="text-muted-foreground"
                        type="button"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!event || mutation.isPending}
                        onClick={() => void handleDelete()}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {mutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
