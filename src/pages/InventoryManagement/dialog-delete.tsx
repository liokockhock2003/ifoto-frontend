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
import { useDeleteMainEquipment, useDeleteSubEquipment } from '@/store/queries/equipment';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

import { MAIN_EQUIPMENT_CONFIG, SUB_KIND_CONFIG, subKindFromType } from './provider';

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
            toast.success('A Main Equipment deleted');
            onDeleted?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete Main Equipment');
        }
    }

    const mainKind = (Object.keys(MAIN_EQUIPMENT_CONFIG) as (keyof typeof MAIN_EQUIPMENT_CONFIG)[])
        .find((key) => MAIN_EQUIPMENT_CONFIG[key].equipmentType === equipment?.equipmentType);
    const typeLabel = mainKind ? MAIN_EQUIPMENT_CONFIG[mainKind].label : (equipment?.equipmentType ?? '');
    const label = equipment
        ? `${typeLabel} — ${equipment.brand} ${equipment.model}`.trim()
        : '—';

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
                        <span className="font-medium text-foreground">{label}</span>.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">Please confirm you want to continue.</p>

                <DialogFooter>
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!equipment || mutation.isPending}
                        onClick={() => void handleDelete()}
                    >
                        {/* <Trash2 className="mr-2 h-4 w-4" /> */}
                        {mutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
            toast.success('A Sub-Equipment deleted');
            onDeleted?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete Sub-Equipment');
        }
    }

    const kind = subKindFromType(equipment?.type);
    const config = kind ? SUB_KIND_CONFIG[kind] : {};
    const label = equipment
        ? config.equipmentTypeLabel
            ? `${config.equipmentTypeLabel}: ${equipment.equipmentType}`
            : (equipment.type ?? equipment.equipmentType)
        : '—';

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
                        <span className="font-medium text-foreground">{label}</span>.
                    </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">Please confirm you want to continue.</p>

                <DialogFooter>
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
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
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
