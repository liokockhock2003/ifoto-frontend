import { useState } from 'react';
import { CalendarDays, ChevronDown, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

import { DatePicker } from '@/components/date-picker';
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
import { Input } from '@/components/ui/input';
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

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Exclude<EquipmentStatusType, 'AVAILABLE'>[] = [
    'MAINTENANCE', 'UNAVAILABLE', 'CONVOCATION', 'MRM',
];

const STATUS_LABEL: Record<EquipmentStatusType, string> = {
    MAINTENANCE:  'Maintenance',
    UNAVAILABLE:  'Unavailable',
    CONVOCATION:  'Convocation',
    MRM:          'MRM Event',
    AVAILABLE:    'Available',
};

const STATUS_BADGE: Record<EquipmentStatusType, string> = {
    MAINTENANCE:  'badge-warning',
    UNAVAILABLE:  'badge-danger',
    CONVOCATION:  'badge-info',
    MRM:          'badge-info',
    AVAILABLE:    'badge-success',
};

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
        <div className="rounded-md border bg-muted/30 p-4 space-y-4">
            <p className="text-sm font-medium">{editing ? 'Edit Status Entry' : 'Add Status Entry'}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

                <Field>
                    <FieldLabel>Notes (optional)</FieldLabel>
                    <Input
                        placeholder="e.g. Annual servicing"
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
                    {isPending ? 'Saving…' : editing ? 'Save Changes' : 'Add Entry'}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ── Delete confirmation ───────────────────────────────────────────────────────

function DeleteConfirm({
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
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm font-medium text-destructive">Remove this status entry?</p>
            <p className="text-xs text-muted-foreground">
                <span className="font-medium">{STATUS_LABEL[entry.statusType]}</span>
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        {equipment.brand} {equipment.model} — Status Entries
                    </DialogTitle>
                    <DialogDescription>
                        {upcomingCount > 0
                            ? `${upcomingCount} upcoming hold${upcomingCount !== 1 ? 's' : ''}`
                            : 'No holds — equipment is available for all dates'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
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
                        <DeleteConfirm
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
                                variant="outline"
                                onClick={() => setMode({ type: 'add' })}
                            >
                                + Add Status
                            </Button>
                        )}
                    </div>

                    {/* Status list */}
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
                    ) : !statuses?.length ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            No status entries — equipment is available for all dates.
                        </p>
                    ) : (
                        <div className="rounded-md border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date Range</th>
                                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Notes</th>
                                        <th className="px-3 py-2" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {statuses.map((entry) => (
                                        <tr key={entry.id} className="border-t">
                                            <td className="px-3 py-2">
                                                <Badge variant="outline" className={STATUS_BADGE[entry.statusType]}>
                                                    {STATUS_LABEL[entry.statusType]}
                                                </Badge>
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
