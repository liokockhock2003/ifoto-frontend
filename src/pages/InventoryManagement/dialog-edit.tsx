import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
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
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useUpdateMainEquipment, useUpdateSubEquipment } from '@/store/queries/equipment';
import type {
    MainEquipment,
    MainEquipmentUpdatePayload,
    SubEquipment,
    SubEquipmentUpdatePayload,
} from '@/store/schemas/equipment';

import { useInventoryManagementContext } from './context';
import { SUB_KIND_CONFIG, subKindFromType } from './provider';

// ── Shared ────────────────────────────────────────────────────────────────────

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
const STATUSES = ['Available', 'In Use', 'Maintenance', 'Unavailable'] as const;

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
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setVal = (field: keyof MainEquipmentUpdatePayload) =>
        (value: string) =>
            setForm((prev) => ({ ...prev, [field]: value }));

    const canSubmit =
        !mutation.isPending &&
        !!equipment &&
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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-muted-foreground">
                <DialogHeader>
                    <DialogTitle>Edit {equipment?.equipmentType || 'Main Equipment'}</DialogTitle>
                    <DialogDescription>
                        Updating{' '}
                        <span className="font-medium text-foreground">
                            {equipment ? `${equipment.brand} ${equipment.model}` : '—'}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel>Brand</FieldLabel>
                        <Input value={form.brand} onChange={set('brand')} />
                    </Field>
                    <Field>
                        <FieldLabel>Model</FieldLabel>
                        <Input value={form.model} onChange={set('model')} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Serial Number</FieldLabel>
                        <Input value={form.serialNumber} onChange={set('serialNumber')} />
                    </Field>
                    <Field>
                        <FieldLabel>Condition</FieldLabel>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground">
                                    {form.condition}
                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width)">
                                {CONDITIONS.map((c) => (
                                    <DropdownMenuItem
                                        key={c}
                                        className={c === form.condition ? 'bg-accent' : ''}
                                        onSelect={() => setVal('condition')(c)}
                                    >
                                        {c}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Field>
                    <Field>
                        <FieldLabel>Status</FieldLabel>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-normal text-muted-foreground">
                                    {form.status}
                                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width)">
                                {STATUSES.map((s) => (
                                    <DropdownMenuItem
                                        key={s}
                                        className={s === form.status ? 'bg-accent' : ''}
                                        onSelect={() => setVal('status')(s)}
                                    >
                                        {s}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Notes</FieldLabel>
                        <Input value={form.notes} onChange={set('notes')} />
                    </Field>
                </div>

                <DialogFooter>
                    <Button className='text-muted-foreground' type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSave()}>
                        {mutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
        cameraModel: equipment?.cameraModel ?? [],
        brand: equipment?.brand ?? null,
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

    const kind = subKindFromType(equipment?.type);
    const config = kind ? SUB_KIND_CONFIG[kind] : {};
    const { cameras } = useInventoryManagementContext();

    const toggleCameraModel = (model: string) =>
        setForm((prev) => ({
            ...prev,
            cameraModel: prev.cameraModel?.includes(model)
                ? prev.cameraModel.filter((m) => m !== model)
                : [...(prev.cameraModel ?? []), model],
        }));

    const setStr = (field: keyof SubEquipmentUpdatePayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setNum = (field: keyof SubEquipmentUpdatePayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));

    const canSubmit =
        !mutation.isPending &&
        !!equipment;

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-muted-foreground">
                <DialogHeader>
                    <DialogTitle>Edit {equipment?.equipmentType || 'Sub Equipment'}</DialogTitle>
                    <DialogDescription>
                        Updating{' '}
                        <span className="font-medium text-foreground">
                            {equipment ? `${equipment.equipmentType}${equipment.brand ? ` — ${equipment.brand}` : ''}` : '—'}
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {config.equipmentTypeLabel && (
                        <Field className="sm:col-span-2">
                            <FieldLabel>{config.equipmentTypeLabel}</FieldLabel>
                            <Input
                                placeholder={config.placeholder}
                                value={form.equipmentType}
                                onChange={setStr('equipmentType')}
                            />
                        </Field>
                    )}

                    {config.showCameraModel && (
                        <Field className="sm:col-span-2">
                            <FieldLabel>Camera Model</FieldLabel>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full justify-between font-normal text-muted-foreground"
                                    >
                                        <span className="truncate">
                                            {form.cameraModel?.length
                                                ? form.cameraModel.join(', ')
                                                : 'Select camera models...'}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-full min-w-(--radix-dropdown-menu-trigger-width)">
                                    {cameras.map((camera) => (
                                        <DropdownMenuCheckboxItem
                                            key={camera.mainEquipmentId}
                                            checked={form.cameraModel?.includes(camera.model) ?? false}
                                            onCheckedChange={() => toggleCameraModel(camera.model)}
                                            onSelect={(e) => e.preventDefault()}
                                        >
                                            {camera.model}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Field>
                    )}

                    {config.showCapacity && (
                        <Field>
                            <FieldLabel>Capacity (GB)</FieldLabel>
                            <Input type="number" min={1} value={form.capacity} onChange={setNum('capacity')} />
                        </Field>
                    )}

                    <Field>
                        <FieldLabel>Total Quantity</FieldLabel>
                        <Input type="number" min={0} value={form.totalQuantity} onChange={setNum('totalQuantity')} />
                    </Field>
                    <Field>
                        <FieldLabel>Used Quantity</FieldLabel>
                        <Input type="number" min={0} value={form.usedQuantity} onChange={setNum('usedQuantity')} />
                    </Field>
                    <Field>
                        <FieldLabel>Available Quantity</FieldLabel>
                        <Input type="number" min={0} value={form.availableQuantity} onChange={setNum('availableQuantity')} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Notes</FieldLabel>
                        <Input value={form.notes} onChange={setStr('notes')} />
                    </Field>
                </div>

                <DialogFooter>
                    <Button className='text-muted-foreground' type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSave()}>
                        {mutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
