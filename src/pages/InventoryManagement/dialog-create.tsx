import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateMainEquipment, useCreateSubEquipment } from '@/store/queries/equipment';
import type { MainEquipmentPayload, SubEquipmentPayload } from '@/store/schemas/equipment';

// ── Shared ────────────────────────────────────────────────────────────────────

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
const STATUSES = ['Available', 'In Use', 'Maintenance', 'Unavailable'] as const;

const selectClass =
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

// ── Main Equipment Create Dialog ───────────────────────────────────────────────

type MainEquipmentCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
};

const defaultMainForm = (): MainEquipmentPayload => ({
    equipmentType: '',
    brand: '',
    model: '',
    serialNumber: '',
    condition: 'Good',
    status: 'Available',
    notes: '',
});

export function MainEquipmentCreateDialog({ open, onOpenChange, onCreated }: MainEquipmentCreateDialogProps) {
    const mutation = useCreateMainEquipment();
    const [form, setForm] = useState<MainEquipmentPayload>(defaultMainForm);

    useEffect(() => {
        if (open) setForm(defaultMainForm());
    }, [open]);

    const set = (field: keyof MainEquipmentPayload) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const canSubmit =
        !mutation.isPending &&
        form.equipmentType.trim() !== '' &&
        form.brand.trim() !== '' &&
        form.model.trim() !== '' &&
        form.serialNumber.trim() !== '';

    async function handleSubmit() {
        try {
            await mutation.mutateAsync(form);
            toast.success('Main equipment added');
            onCreated?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add equipment');
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <CardHeader>
                    <CardTitle>Add Main Equipment</CardTitle>
                    <CardDescription>Fill in the details for the new equipment item.</CardDescription>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Equipment Type</Label>
                        <Input placeholder="e.g. Camera Body" value={form.equipmentType} onChange={set('equipmentType')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input placeholder="e.g. Sony" value={form.brand} onChange={set('brand')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Model</Label>
                        <Input placeholder="e.g. A7 IV" value={form.model} onChange={set('model')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Serial Number</Label>
                        <Input placeholder="e.g. SN-SONY-A7IV-001" value={form.serialNumber} onChange={set('serialNumber')} />
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
                        <Input placeholder="Optional notes" value={form.notes} onChange={set('notes')} />
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
                        {mutation.isPending ? 'Adding...' : 'Add Equipment'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

// ── Sub Equipment Create Dialog ────────────────────────────────────────────────

type SubEquipmentCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
};

const defaultSubForm = (): SubEquipmentPayload => ({
    equipmentType: '',
    brand: '',
    model: '',
    capacity: 1,
    totalQuantity: 1,
    usedQuantity: 0,
    availableQuantity: 1,
    notes: '',
});

export function SubEquipmentCreateDialog({ open, onOpenChange, onCreated }: SubEquipmentCreateDialogProps) {
    const mutation = useCreateSubEquipment();
    const [form, setForm] = useState<SubEquipmentPayload>(defaultSubForm);

    useEffect(() => {
        if (open) setForm(defaultSubForm());
    }, [open]);

    const setStr = (field: keyof SubEquipmentPayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setNum = (field: keyof SubEquipmentPayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));

    const canSubmit =
        !mutation.isPending &&
        (form.equipmentType as string).trim() !== '' &&
        (form.brand as string).trim() !== '' &&
        (form.model as string).trim() !== '';

    async function handleSubmit() {
        try {
            await mutation.mutateAsync(form);
            toast.success('Sub-equipment added');
            onCreated?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to add sub-equipment');
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <CardHeader>
                    <CardTitle>Add Sub-Equipment</CardTitle>
                    <CardDescription>Fill in the details for the new sub-equipment item.</CardDescription>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label>Equipment Type</Label>
                        <Input placeholder="e.g. Lens" value={form.equipmentType} onChange={setStr('equipmentType')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input placeholder="e.g. Sony" value={form.brand} onChange={setStr('brand')} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Model</Label>
                        <Input placeholder="e.g. FE 24-70mm f/2.8 GM" value={form.model} onChange={setStr('model')} />
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
                        <Input placeholder="Optional notes" value={form.notes} onChange={setStr('notes')} />
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
                        {mutation.isPending ? 'Adding...' : 'Add Sub-Equipment'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
