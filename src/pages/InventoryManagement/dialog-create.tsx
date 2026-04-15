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
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateMainEquipment, useCreateSubEquipment } from '@/store/queries/equipment';
import type { MainEquipmentPayload, SubEquipmentPayload } from '@/store/schemas/equipment';

import { useInventoryManagementContext } from './context';
import { MAIN_EQUIPMENT_CONFIG, SUB_EQUIPMENT_CONFIG, SUB_EQUIPMENT_KEYS, SUB_KIND_CONFIG, type SubKindConfig } from './provider';

// ── Shared ────────────────────────────────────────────────────────────────────

const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
const STATUSES = ['Available', 'In Use', 'Maintenance', 'Unavailable'] as const;

// ── Main Equipment Create Dialog ───────────────────────────────────────────────

type MainEquipmentKind = keyof typeof MAIN_EQUIPMENT_CONFIG;

type MainEquipmentCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipmentKind: MainEquipmentKind;
    onCreated?: () => void;
};

const defaultMainForm = (kind: MainEquipmentKind): MainEquipmentPayload => ({
    equipmentType: MAIN_EQUIPMENT_CONFIG[kind].label,
    lensType: '',
    brand: '',
    model: '',
    serialNumber: '',
    condition: 'Good',
    status: 'Available',
    notes: '',
});

export function MainEquipmentCreateDialog({ open, onOpenChange, equipmentKind, onCreated }: MainEquipmentCreateDialogProps) {
    const mutation = useCreateMainEquipment();
    const [form, setForm] = useState<MainEquipmentPayload>(() => defaultMainForm(equipmentKind));

    useEffect(() => {
        if (open) setForm(defaultMainForm(equipmentKind));
    }, [open, equipmentKind]);

    const set = (field: keyof MainEquipmentPayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setVal = (field: keyof MainEquipmentPayload) =>
        (value: string) =>
            setForm((prev) => ({ ...prev, [field]: value }));

    const canSubmit =
        !mutation.isPending &&
        form.brand.trim() !== '' &&
        form.model.trim() !== '' &&
        form.serialNumber.trim() !== '';

    async function handleSubmit() {
        try {
            await mutation.mutateAsync(form);
            toast.success(`${MAIN_EQUIPMENT_CONFIG[equipmentKind].label} added`);
            onCreated?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to add ${MAIN_EQUIPMENT_CONFIG[equipmentKind].label}`);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className='text-muted-foreground'>Add {MAIN_EQUIPMENT_CONFIG[equipmentKind].label}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new {MAIN_EQUIPMENT_CONFIG[equipmentKind].label.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {equipmentKind === 'lenses' && (
                        <Field className="sm:col-span-2">
                            <FieldLabel>Lens Type</FieldLabel>
                            <Input placeholder="e.g. PRIME" value={form.lensType ?? ''} onChange={set('lensType')} />
                        </Field>
                    )}
                    <Field>
                        <FieldLabel>Brand</FieldLabel>
                        <Input placeholder="e.g. Sony" value={form.brand} onChange={set('brand')} />
                    </Field>
                    <Field>
                        <FieldLabel>Model</FieldLabel>
                        <Input placeholder="e.g. A7 IV" value={form.model} onChange={set('model')} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Serial Number</FieldLabel>
                        <Input placeholder="e.g. SN-SONY-A7IV-001" value={form.serialNumber} onChange={set('serialNumber')} />
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
                                <DropdownMenuRadioGroup value={form.condition} onValueChange={setVal('condition')}>
                                    {CONDITIONS.map((c) => (
                                        <DropdownMenuRadioItem key={c} value={c}>{c}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
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
                                <DropdownMenuRadioGroup value={form.status} onValueChange={setVal('status')}>
                                    {STATUSES.map((s) => (
                                        <DropdownMenuRadioItem key={s} value={s}>{s}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Notes</FieldLabel>
                        <Input placeholder="Optional notes" value={form.notes} onChange={set('notes')} />
                    </Field>
                </div>

                <DialogFooter>
                    <Button className='text-muted-foreground' type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
                        {mutation.isPending ? 'Adding...' : `Add ${MAIN_EQUIPMENT_CONFIG[equipmentKind].label}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Sub Equipment Create Dialog ────────────────────────────────────────────────

type SubEquipmentKind = keyof typeof SUB_EQUIPMENT_CONFIG;


type SubEquipmentCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipmentKind: SubEquipmentKind;
    onCreated?: () => void;
};

const toSafeSubKind = (kind: string): SubEquipmentKind =>
    kind in SUB_EQUIPMENT_CONFIG ? (kind as SubEquipmentKind) : SUB_EQUIPMENT_KEYS[0];

const defaultSubForm = (kind: SubEquipmentKind): SubEquipmentPayload => ({
    type: SUB_EQUIPMENT_CONFIG[kind].typeValue,
    equipmentType: '',
    cameraModel: [],
    brand: null,
    capacity: 1,
    totalQuantity: 1,
    usedQuantity: 0,
    availableQuantity: 1,
    notes: '',
});

export function SubEquipmentCreateDialog({ open, onOpenChange, equipmentKind, onCreated }: SubEquipmentCreateDialogProps) {
    const mutation = useCreateSubEquipment();
    const { cameras } = useInventoryManagementContext();
    const [form, setForm] = useState<SubEquipmentPayload>(() => defaultSubForm(toSafeSubKind(equipmentKind)));

    useEffect(() => {
        if (open) setForm(defaultSubForm(toSafeSubKind(equipmentKind)));
    }, [open, equipmentKind]);

    const config: SubKindConfig = SUB_KIND_CONFIG[equipmentKind] ?? {};

    const setStr = (field: keyof SubEquipmentPayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setNum = (field: keyof SubEquipmentPayload) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }));

    const toggleCameraModel = (model: string) =>
        setForm((prev) => ({
            ...prev,
            cameraModel: prev.cameraModel?.includes(model)
                ? prev.cameraModel.filter((m) => m !== model)
                : [...(prev.cameraModel ?? []), model],
        }));

    const canSubmit =
        !mutation.isPending &&
        (!config.equipmentTypeLabel || form.equipmentType.trim() !== '');

    async function handleSubmit() {
        try {
            await mutation.mutateAsync(form);
            toast.success(`${SUB_EQUIPMENT_CONFIG[equipmentKind]?.label} added`);
            onCreated?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to add ${SUB_EQUIPMENT_CONFIG[equipmentKind]?.label}`);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-muted-foreground">
                <DialogHeader>
                    <DialogTitle>Add {SUB_EQUIPMENT_CONFIG[equipmentKind]?.label}</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new {SUB_EQUIPMENT_CONFIG[equipmentKind]?.label.toLowerCase()}.
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
                                        className="w-full justify-between font-normal"
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
                        <Input placeholder="Optional notes" value={form.notes} onChange={setStr('notes')} />
                    </Field>
                </div>

                <DialogFooter>
                    <Button className='text-muted-foreground' type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
                        {mutation.isPending ? 'Adding...' : `Add ${SUB_EQUIPMENT_CONFIG[equipmentKind]?.label}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
