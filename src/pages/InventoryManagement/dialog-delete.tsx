import { AlertTriangle, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeleteMainEquipment, useDeleteSubEquipment } from '@/store/queries/equipment';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

// ── Main Equipment Delete Dialog ───────────────────────────────────────────────

type MainEquipmentDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: MainEquipment | null;
    onDeleted?: () => void;
};

export function MainEquipmentDeleteDialog({ open, onOpenChange, equipment, onDeleted }: MainEquipmentDeleteDialogProps) {
    const mutation = useDeleteMainEquipment();

    async function handleDelete() {
        if (!equipment) return;
        try {
            await mutation.mutateAsync({ mainEquipmentId: equipment.mainEquipmentId });
            toast.success('Equipment deleted');
            onDeleted?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete equipment');
        }
    }

    if (!open) return null;

    const label = equipment ? `${equipment.brand} ${equipment.model}` : '—';

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
                        <span className="font-medium text-foreground">{label}</span>.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">Please confirm you want to continue.</p>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!equipment || mutation.isPending}
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

// ── Sub Equipment Delete Dialog ────────────────────────────────────────────────

type SubEquipmentDeleteDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: SubEquipment | null;
    onDeleted?: () => void;
};

export function SubEquipmentDeleteDialog({ open, onOpenChange, equipment, onDeleted }: SubEquipmentDeleteDialogProps) {
    const mutation = useDeleteSubEquipment();

    async function handleDelete() {
        if (!equipment) return;
        try {
            await mutation.mutateAsync({ subEquipmentId: equipment.subEquipmentId });
            toast.success('Sub-equipment deleted');
            onDeleted?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete sub-equipment');
        }
    }

    if (!open) return null;

    const label = equipment ? `${equipment.brand} ${equipment.model}` : '—';

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
                        <span className="font-medium text-foreground">{label}</span>.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground">Please confirm you want to continue.</p>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!equipment || mutation.isPending}
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
