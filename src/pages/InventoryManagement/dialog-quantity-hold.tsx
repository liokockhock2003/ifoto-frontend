import { useState } from 'react';
import { Minus, PackageMinus, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteConfirm, ScheduleEntryForm } from '@/components/schedule-entry-form';
import { ManagementTable } from '@/components/management-table';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        <ScheduleEntryForm
            title={editing ? 'Edit Schedule' : 'Add Schedule'}
            startDate={form.startDate}
            endDate={form.endDate}
            notes={form.notes}
            onStartChange={(d) => setForm((p) => ({ ...p, startDate: d }))}
            onEndChange={(d) => setForm((p) => ({ ...p, endDate: d }))}
            onNotesChange={(n) => setForm((p) => ({ ...p, notes: n }))}
            onSubmit={() => void handleSubmit()}
            onCancel={onCancel}
            isPending={isPending}
            canSubmit={canSubmit}
            submitLabel={editing ? 'Save Changes' : 'Add Schedule'}
            notesPlaeholder="e.g. Sent for repair"
            extraFields={
                <Field>
                    <FieldLabel>Quantity</FieldLabel>
                    <ButtonGroup>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={form.quantity <= 1}
                            onClick={() => setForm((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <ButtonGroupText className="px-4 text-sm border-0 justify-center min-w-[2.5rem]">
                            {form.quantity}
                        </ButtonGroupText>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setForm((p) => ({ ...p, quantity: p.quantity + 1 }))}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </ButtonGroup>
                </Field>
            }
        />
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
            toast.error(err instanceof Error ? err.message : 'Failed to delete schedule');
        }
    }

    return (
        <DeleteConfirm
            title="Remove this quantity schedule?"
            description={
                <><span className="font-medium text-foreground">{entry.quantity} unit{entry.quantity !== 1 ? 's' : ''}</span>{' · '}{fmtDate(entry.startDate)} – {fmtDate(entry.endDate)}</>
            }
            onDelete={() => void handleDelete()}
            onCancel={onCancel}
            isPending={mutation.isPending}
        />
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
            <DialogContent className="sm:max-w-2xl text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <PackageMinus className="h-4 w-4 text-primary" />
                        {displayName}
                    </DialogTitle>
                    <DialogDescription>
                        {holdCount > 0
                            ? `${holdCount} active schedule${holdCount !== 1 ? 's' : ''}`
                            : 'No schedule — full quantity available'}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh]">
                    <div className="space-y-4 pr-4">
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
                                All Schedules
                            </p>
                            {mode.type === 'idle' && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setMode({ type: 'add' })}
                                >
                                    + Add Schedule
                                </Button>
                            )}
                        </div>

                        <ManagementTable
                            data={holds}
                            isLoading={isLoading}
                            emptyMessage="No quantity schedules — full quantity is available for all dates."
                            getKey={(entry) => entry.id}
                            columns={[
                                {
                                    key: 'quantity',
                                    header: 'Quantity',
                                    className: 'font-medium',
                                    render: (entry) => `${entry.quantity} unit${entry.quantity !== 1 ? 's' : ''}`,
                                },
                                {
                                    key: 'dateRange',
                                    header: 'Date Range',
                                    className: 'text-xs',
                                    render: (entry) => `${fmtDate(entry.startDate)} – ${fmtDate(entry.endDate)}`,
                                },
                                {
                                    key: 'notes',
                                    header: 'Notes',
                                    className: 'text-xs text-muted-foreground',
                                    render: (entry) => entry.notes ?? '—',
                                },
                            ]}
                            onEdit={(entry) => setMode({ type: 'edit', entry })}
                            onDelete={(entry) => setMode({ type: 'delete', entry })}
                        />
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
