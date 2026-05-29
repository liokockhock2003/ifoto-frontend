import { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { DeleteConfirm, ScheduleEntryForm } from '@/components/schedule-entry-form';
import { ManagementTable } from '@/components/management-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    useCreateEquipmentStatus,
    useDeleteEquipmentStatus,
    useEquipmentStatuses,
    useUpdateEquipmentStatus,
} from '@/store/queries/equipment';
import type {
    EquipmentDateStatus,
    EquipmentStatusPayload,
    EquipmentStatusType,
    MainEquipment,
} from '@/store/schemas/equipment';
import {
    EQUIPMENT_STATUS_OPTIONS as STATUS_OPTIONS,
    EQUIPMENT_STATUS_LABEL as STATUS_LABEL,
    EQUIPMENT_STATUS_BADGE as STATUS_BADGE,
} from '@/constants/equipmentStatus';

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Inline form ───────────────────────────────────────────────────────────────

type FormState = {
    statusType: Exclude<EquipmentStatusType, 'AVAILABLE'>;
    startDate: string;
    endDate: string;
    notes: string;
};

const defaultForm = (): FormState => ({
    statusType: 'MAINTENANCE',
    startDate: '',
    endDate: '',
    notes: '',
});

function StatusForm({
    mainEquipmentId,
    editing,
    onDone,
    onCancel,
}: {
    mainEquipmentId: number;
    editing: EquipmentDateStatus | null;
    onDone: () => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<FormState>(() =>
        editing
            ? { statusType: editing.statusType as Exclude<EquipmentStatusType, 'AVAILABLE'>, startDate: editing.startDate, endDate: editing.endDate, notes: editing.notes ?? '' }
            : defaultForm()
    );

    const createMutation = useCreateEquipmentStatus();
    const updateMutation = useUpdateEquipmentStatus();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const canSubmit = !!form.statusType && !!form.startDate && !!form.endDate;

    async function handleSubmit() {
        const payload: EquipmentStatusPayload = {
            statusType: form.statusType,
            startDate: form.startDate,
            endDate: form.endDate,
            notes: form.notes || undefined,
        };
        try {
            if (editing) {
                await updateMutation.mutateAsync({ mainEquipmentId, statusId: editing.id, ...payload });
            } else {
                await createMutation.mutateAsync({ mainEquipmentId, ...payload });
            }
            onDone();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to save status');
        }
    }

    return (
        <ScheduleEntryForm
            title={editing ? 'Edit Status Entry' : 'Add Status Entry'}
            startDate={form.startDate}
            endDate={form.endDate}
            notes={form.notes}
            onStartChange={(d) => setForm((p) => ({ ...p, startDate: d, endDate: p.endDate && p.endDate < d ? '' : p.endDate }))}
            onEndChange={(d) => setForm((p) => ({ ...p, endDate: d }))}
            onNotesChange={(n) => setForm((p) => ({ ...p, notes: n }))}
            onSubmit={() => void handleSubmit()}
            onCancel={onCancel}
            isPending={isPending}
            canSubmit={canSubmit}
            submitLabel={editing ? 'Save Changes' : 'Add Entry'}
            notesPlaeholder="e.g. Annual servicing"
            extraFields={
                <Field>
                    <FieldLabel>Status Type</FieldLabel>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full justify-between font-normal">
                                {STATUS_LABEL[form.statusType]}
                                <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width)">
                            {STATUS_OPTIONS.map((s) => (
                                <DropdownMenuItem
                                    key={s}
                                    className={s === form.statusType ? 'bg-accent' : ''}
                                    onSelect={() => setForm((p) => ({ ...p, statusType: s }))}
                                >
                                    {STATUS_LABEL[s]}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </Field>
            }
        />
    );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function StatusDeleteConfirm({
    mainEquipmentId,
    entry,
    onDone,
    onCancel,
}: {
    mainEquipmentId: number;
    entry: EquipmentDateStatus;
    onDone: () => void;
    onCancel: () => void;
}) {
    const mutation = useDeleteEquipmentStatus();

    async function handleDelete() {
        try {
            await mutation.mutateAsync({ mainEquipmentId, statusId: entry.id });
            onDone();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to delete status');
        }
    }

    return (
        <DeleteConfirm
            title="Remove this status entry?"
            description={
                <><span className="font-medium text-foreground">{STATUS_LABEL[entry.statusType]}</span>{' · '}{fmtDate(entry.startDate)} – {fmtDate(entry.endDate)}</>
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
    | { type: 'edit'; entry: EquipmentDateStatus }
    | { type: 'delete'; entry: EquipmentDateStatus };

type EquipmentStatusDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    equipment: MainEquipment;
};

export function EquipmentStatusDialog({ open, onOpenChange, equipment }: EquipmentStatusDialogProps) {
    const { data: statuses, isLoading } = useEquipmentStatuses(
        open ? equipment.mainEquipmentId : 0
    );
    const [mode, setMode] = useState<DialogMode>({ type: 'idle' });

    const upcomingCount = statuses?.length ?? 0;

    return (
        <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setMode({ type: 'idle' }); }}>
            <DialogContent className="sm:max-w-2xl text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-primary">
                        <CalendarDays className="h-4 w-4" />
                        {equipment.brand} {equipment.model}
                    </DialogTitle>
                    <DialogDescription>
                        {upcomingCount > 0
                            ? `${upcomingCount} upcoming schedules${upcomingCount !== 1 ? 's' : ''}`
                            : 'No schedules — equipment is available for all dates'}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh]">
                <div className="space-y-4 pr-4">
                    {/* Inline form / delete confirm */}
                    {mode.type === 'add' && (
                        <StatusForm
                            mainEquipmentId={equipment.mainEquipmentId}
                            editing={null}
                            onDone={() => setMode({ type: 'idle' })}
                            onCancel={() => setMode({ type: 'idle' })}
                        />
                    )}
                    {mode.type === 'edit' && (
                        <StatusForm
                            mainEquipmentId={equipment.mainEquipmentId}
                            editing={mode.entry}
                            onDone={() => setMode({ type: 'idle' })}
                            onCancel={() => setMode({ type: 'idle' })}
                        />
                    )}
                    {mode.type === 'delete' && (
                        <StatusDeleteConfirm
                            mainEquipmentId={equipment.mainEquipmentId}
                            entry={mode.entry}
                            onDone={() => setMode({ type: 'idle' })}
                            onCancel={() => setMode({ type: 'idle' })}
                        />
                    )}

                    <Separator />

                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            All Entries
                        </p>
                        {mode.type === 'idle' && (
                            <Button
                                type="button"
                                size="sm"
                                // variant="outline"
                                onClick={() => setMode({ type: 'add' })}
                            >
                                + Add Status
                            </Button>
                        )}
                    </div>

                    {/* Status list */}
                    <ManagementTable
                        data={statuses}
                        isLoading={isLoading}
                        emptyMessage="No status entries — equipment is available for all dates."
                        getKey={(entry) => entry.id}
                        columns={[
                            {
                                key: 'status',
                                header: 'Status',
                                render: (entry) => (
                                    <Badge variant="outline" className={STATUS_BADGE[entry.statusType]}>
                                        {STATUS_LABEL[entry.statusType]}
                                    </Badge>
                                ),
                            },
                            {
                                key: 'dateRange',
                                header: 'Date Range',
                                className: 'text-xs text-foreground',
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
