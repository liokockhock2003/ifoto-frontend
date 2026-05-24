import { ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type EquipmentRequestConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
    cartCount: number;
    startDate: string;
    endDate: string;
    notes: string;
};

function formatDisplayDate(iso: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function EquipmentRequestConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
    cartCount,
    startDate,
    endDate,
    notes,
}: EquipmentRequestConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Submit Equipment Request
                    </DialogTitle>
                    <DialogDescription>
                        Please confirm the details below before submitting.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 rounded-md border bg-muted/30 p-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Equipment selected</span>
                        <span className="font-medium">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Start date</span>
                        <span className="font-medium">{formatDisplayDate(startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">End date</span>
                        <span className="font-medium">{formatDisplayDate(endDate)}</span>
                    </div>
                    {notes && (
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Notes</span>
                            <p className="rounded bg-muted px-2 py-1">{notes}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        className="text-muted-foreground"
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Back
                    </Button>
                    <Button type="button" disabled={isPending} onClick={onConfirm}>
                        {isPending ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
