import { useState } from 'react';
import { PackageMinus, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
    useCreateQuantityHold,
    useDeleteQuantityHold,
    useSubEquipmentQuantityHolds,
    useUpdateQuantityHold,
} from '@/store/queries/equipment';
import type { SubEquipment, SubEquipmentQuantityHold } from '@/store/schemas/equipment';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Inline form ───────────────────────────────────────────────────────────────

type HoldFormState = {
    quantity: number;
    startDate: string;
    endDate: string;
    notes: string;
};

const defaultHoldForm = (): HoldFormState => ({
    quantity: 1,
    startDate: '',
    endDate: '',
    notes: '',
});

function HoldForm({
    subEquipmentId,
    editing,
    onDone,
    onCancel,
}: {
    subEquipmentId: number;
    editing: SubEquipmentQuantityHold | null;
    onDone: () => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<HoldFormState>(() =>
        editing
            ? { quantity: editing.quantity, startDate: editing.startDate, endDate: editing.endDate, notes: editing.notes ?? '' }
            : defaultHoldForm()
    );

    const createMutation = useCreateQuantityHold();
    const updateMutation = useUpdateQuantityHold();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const canSubmit = form.quantity >= 1 && !!form.startDate && !!form.endDate;

    async function handleSubmit() {
        const payload = {
            quantity: form.quantity,
            startDate: form.startDate,
            endDate: form.endDate,
            notes: form.notes || undefined,
        };
        try {
            if (editing) {
                await updateMutation.mutateAsync({ subEquipmentId, holdId: editing.id, ...payload });
            } else {
                await createMutation.mutateAsync({ subEquipmentId, ...payload });
            }
            onDone();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save hold');
        }
    }

    return (
        <div className="rounded-md border bg-muted/30 p-4 space-y-4">
            <p className="text-sm font-medium">{editing ? 'Edit Hold' : 'Add Hold'}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field>
                    <FieldLabel>Quantity</FieldLabel>
                    <Input
                        type="number"
                        min={1}
                        value={form.quantity}
                        onChange={(e) => setForm((p) => ({ ...p, quantity: Math.max(1, Number(e.target.value)) }))}
                    />
                </Field>

                <Field>
                    <FieldLabel>Notes (optional)</FieldLabel>
                    <Input
                        placeholder="e.g. Sent for repair"
                        value={form.notes}
                        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    />
                </Field>

                <Field>
                    <FieldLabel>Start Date</FieldLabel>
                    <DatePicker
                        value={form.startDate}
                        onChange={(d) => setForm((p) => ({ ...p, startDate: d, endDate: p.endDate && p.endDate < d ? '' : p.endDate }))}
                    />
                </Field>

                <Field>
                    <FieldLabel>End Date</FieldLabel>
                    <DatePicker
                        value={form.endDate}
                        onChange={(d) => setForm((p) => ({ ...p, endDate: d }))}
                        disabled={!form.startDate}
                    />
                </Field>
            </div>

            <div className="flex gap-2">
                <Button type="button" size="sm" disabled={!canSubmit || isPending} onClick={() => void handleSubmit()}>
                    {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Hold'}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteHoldConfirm({
    subEquipmentId,
    entry,
    onDone,
    onCancel,
}: {
    subEquipmentId: number;
    entry: SubEquipmentQuantityHold;
    onDone: () => void;
    onCancel: () => void;
}) {
    const mutation = useDeleteQuantityHold();

    async function handleDelete() {
        try {
            await mutation.mutateAsync({ subEquipmentId, holdId: entry.id });
            onDone();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete hold');
        }
    }

    return (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm font-medium text-destructive">Remove this quantity hold?</p>
            <p className="text-xs text-muted-foreground">
                <span className="font-medium">{entry.quantity} unit{entry.quantity !== 1 ? 's' : ''}</span>
                {' · '}
                {fmtDate(entry.startDate)} – {fmtDate(entry.endDate)}
            </p>
            <div className="flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={mutation.isPending}
                    onClick={() => void handleDelete()}
                >
                    {mutation.isPending ? 'Deleting…' : 'Delete'}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={mutation.isPending} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ── Main dialog ───────────────────────────────────────────────────────────────

type DialogMode =
    | { type: 'idle' }
    | { type: 'add' }
    | { type: 'edit'; entry: SubEquipmentQuantityHold }
    | { type: 'delete'; entry: SubEquipmentQuantityHold };

type SubEquipmentQuantityHoldDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: SubEquipment;
};

export function SubEquipmentQuantityHoldDialog({ open, onOpenChange, equipment }: SubEquipmentQuantityHoldDialogProps) {
    const { data: holds, isLoading } = useSubEquipmentQuantityHolds(
        open ? equipment.subEquipmentId : 0
    );
    const [mode, setMode] = useState<DialogMode>({ type: 'idle' });

    const holdCount = holds?.length ?? 0;
    const displayName = equipment.equipmentType + (equipment.brand ? ` — ${equipment.brand}` : '');

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setMode({ type: 'idle' }); }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PackageMinus className="h-4 w-4 text-primary" />
                        {displayName} — Quantity Holds
                    </DialogTitle>
                    <DialogDescription>
                        {holdCount > 0
                            ? `${holdCount} active hold${holdCount !== 1 ? 's' : ''}`
                            : 'No holds — full quantity available'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {mode.type === 'add' && (
                        <HoldForm
                            subEquipmentId={equipment.subEquipmentId}
                            editing={null}
                            onDone={() => setMode({ type: 'idle' })}
                            onCancel={() => setMode({ type: 'idle' })}
                        />
                    )}
                    {mode.type === 'edit' && (
                        <HoldForm
                            subEquipmentId={equipment.subEquipmentId}
                            editing={mode.entry}
                            onDone={() => setMode({ type: 'idle' })}
                            onCancel={() => setMode({ type: 'idle' })}
                        />
                    )}
                    {mode.type === 'delete' && (
                        <DeleteHoldConfirm
                            subEquipmentId={equipment.subEquipmentId}
                            entry={mode.entry}
                            onDone={() => setMode({ type: 'idle' })}
                            onCancel={() => setMode({ type: 'idle' })}
                        />
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            All Holds
                        </p>
                        {mode.type === 'idle' && (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setMode({ type: 'add' })}
                            >
                                + Add Hold
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
                    ) : !holds?.length ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No quantity holds — full quantity is available for all dates.
                        </p>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Quantity</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date Range</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Notes</th>
                                        <th className="px-3 py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {holds.map((entry) => (
                                        <tr key={entry.id} className="border-t">
                                            <td className="px-3 py-2 font-medium">
                                                {entry.quantity} unit{entry.quantity !== 1 ? 's' : ''}
                                            </td>
                                            <td className="px-3 py-2 text-xs">
                                                {fmtDate(entry.startDate)} – {fmtDate(entry.endDate)}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-muted-foreground">
                                                {entry.notes ?? '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        onClick={() => setMode({ type: 'edit', entry })}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => setMode({ type: 'delete', entry })}
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
