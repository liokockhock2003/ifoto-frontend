import { AlertTriangle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Confirm Deletion
                    </CardTitle>
                    <CardDescription>
                        This action cannot be undone. You are about to permanently delete{' '}
                        <span className="font-medium text-foreground">{event?.eventName ?? '—'}</span>.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">Please confirm you want to continue.</p>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="mr-2 h-4 w-4" />
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
                </CardFooter>
            </Card>
        </div>
    );
}
