import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateMainEquipment, useUpdateSubEquipment } from '@/store/queries/equipment';
import type {
    MainEquipment,
    MainEquipmentUpdatePayload,
    SubEquipment,
    SubEquipmentUpdatePayload,
} from '@/store/schemas/equipment';

// ── Shared ────────────────────────────────────────────────────────────────────

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
const STATUSES = ['Available', 'In Use', 'Maintenance', 'Unavailable'] as const;

const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

// ── Main Equipment Edit Dialog ─────────────────────────────────────────────────

type MainEquipmentEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: MainEquipment | null;
    onUpdated?: () => void;
};

function toMainForm(equipment: MainEquipment | null): MainEquipmentUpdatePayload {
    return {
        mainEquipmentId: equipment?.mainEquipmentId ?? 0,
        equipmentType: equipment?.equipmentType ?? '',
        brand: equipment?.brand ?? '',
        model: equipment?.model ?? '',
        serialNumber: equipment?.serialNumber ?? '',
        condition: equipment?.condition ?? 'Good',
        status: equipment?.status ?? 'Available',
        notes: equipment?.notes ?? '',
    };
}

export function MainEquipmentEditDialog({ open, onOpenChange, equipment, onUpdated }: MainEquipmentEditDialogProps) {
    const mutation = useUpdateMainEquipment();
    const [form, setForm] = useState<MainEquipmentUpdatePayload>(() => toMainForm(equipment));

    useEffect(() => {
        setForm(toMainForm(equipment));
    }, [equipment, open]);

    const set = (field: keyof MainEquipmentUpdatePayload) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const canSubmit =
        !mutation.isPending &&
        !!equipment &&
        form.equipmentType.trim() !== '' &&
        form.brand.trim() !== '' &&
        form.model.trim() !== '' &&
        form.serialNumber.trim() !== '';

    async function handleSave() {
        if (!equipment) return;
        try {
            await mutation.mutateAsync(form);
            toast.success('A Main Equipment updated');
            onUpdated?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update Main Equipment');
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <CardHeader>
                    <CardTitle>Edit Main Equipment</CardTitle>
                    <CardDescription>
                        Updating{' '}
                        <span className="font-medium text-foreground">
                            {equipment ? `${equipment.brand} ${equipment.model}` : '—'}
                        </span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Equipment Type</Label>
                        <Input value={form.equipmentType} onChange={set('equipmentType')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input value={form.brand} onChange={set('brand')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Model</Label>
                        <Input value={form.model} onChange={set('model')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Serial Number</Label>
                        <Input value={form.serialNumber} onChange={set('serialNumber')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Condition</Label>
                        <select className={selectClass} value={form.condition} onChange={set('condition')}>
                            {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label>Status</Label>
                        <select className={selectClass} value={form.status} onChange={set('status')}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Notes</Label>
                        <Input value={form.notes} onChange={set('notes')} />
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSave()}>
                        {mutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

// ── Sub Equipment Edit Dialog ──────────────────────────────────────────────────

type SubEquipmentEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: SubEquipment | null;
    onUpdated?: () => void;
};

function toSubForm(equipment: SubEquipment | null): SubEquipmentUpdatePayload {
    return {
        subEquipmentId: equipment?.subEquipmentId ?? 0,
        equipmentType: equipment?.equipmentType ?? '',
        brand: equipment?.brand ?? '',
        model: equipment?.model ?? '',
        capacity: equipment?.capacity ?? 1,
        totalQuantity: equipment?.totalQuantity ?? 1,
        usedQuantity: equipment?.usedQuantity ?? 0,
        availableQuantity: equipment?.availableQuantity ?? 1,
        notes: equipment?.notes ?? '',
    };
}

export function SubEquipmentEditDialog({ open, onOpenChange, equipment, onUpdated }: SubEquipmentEditDialogProps) {
    const mutation = useUpdateSubEquipment();
    const [form, setForm] = useState<SubEquipmentUpdatePayload>(() => toSubForm(equipment));

    useEffect(() => {
        setForm(toSubForm(equipment));
    }, [equipment, open]);

    const setStr = (field: keyof SubEquipmentUpdatePayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setNum = (field: keyof SubEquipmentUpdatePayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));

    const canSubmit =
        !mutation.isPending &&
        !!equipment &&
        (form.equipmentType as string).trim() !== '' &&
        (form.brand as string).trim() !== '' &&
        (form.model as string).trim() !== '';

    async function handleSave() {
        if (!equipment) return;
        try {
            await mutation.mutateAsync(form);
            toast.success('A Sub-Equipment updated');
            onUpdated?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update Sub-Equipment');
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <CardHeader>
                    <CardTitle>Edit Sub-Equipment</CardTitle>
                    <CardDescription>
                        Updating{' '}
                        <span className="font-medium text-foreground">
                            {equipment ? `${equipment.brand} ${equipment.model}` : '—'}
                        </span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Equipment Type</Label>
                        <Input value={form.equipmentType} onChange={setStr('equipmentType')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input value={form.brand} onChange={setStr('brand')} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Model</Label>
                        <Input value={form.model} onChange={setStr('model')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Capacity</Label>
                        <Input type="number" min={1} value={form.capacity} onChange={setNum('capacity')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Total Quantity</Label>
                        <Input type="number" min={0} value={form.totalQuantity} onChange={setNum('totalQuantity')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Used Quantity</Label>
                        <Input type="number" min={0} value={form.usedQuantity} onChange={setNum('usedQuantity')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Available Quantity</Label>
                        <Input type="number" min={0} value={form.availableQuantity} onChange={setNum('availableQuantity')} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Notes</Label>
                        <Input value={form.notes} onChange={setStr('notes')} />
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSave()}>
                        {mutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
