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
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

type EquipmentRequestConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
    cartIds: number[];
    subQty: Record<number, number>;
    mainEquipment: MainEquipment[];
    subEquipment: SubEquipment[];
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
    cartIds,
    subQty,
    mainEquipment,
    subEquipment,
    startDate,
    endDate,
    notes,
}: EquipmentRequestConfirmationDialogProps) {
    const mainEquipmentMap = new Map(mainEquipment.map((e) => [e.mainEquipmentId, e]));
    const subEquipmentMap = new Map(subEquipment.map((e) => [e.subEquipmentId, e]));

    const subEntries = Object.entries(subQty)
        .filter(([, qty]) => qty > 0)
        .map(([idStr, qty]) => ({ id: Number(idStr), qty }));

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
                    {/* Main equipment */}
                    {cartIds.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Equipment ({cartIds.length})</p>
                            {cartIds.map((id) => {
                                const eq = mainEquipmentMap.get(id);
                                return (
                                    <p key={id} className="font-medium pl-2">
                                        {eq ? `${eq.brand} ${eq.model}` : `Equipment #${id}`}
                                    </p>
                                );
                            })}
                        </div>
                    )}

                    {/* Sub-equipment */}
                    {subEntries.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-muted-foreground">Accessories ({subEntries.length} type{subEntries.length !== 1 ? 's' : ''})</p>
                            {subEntries.map(({ id, qty }) => {
                                const eq = subEquipmentMap.get(id);
                                const label = eq
                                    ? eq.brand ? `${eq.brand} ${eq.equipmentType}` : eq.equipmentType
                                    : `Accessory #${id}`;
                                return (
                                    <p key={id} className="font-medium pl-2">
                                        {label} <span className="text-muted-foreground tabular-nums">× {qty}</span>
                                    </p>
                                );
                            })}
                        </div>
                    )}

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
