import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { ScheduleEntryForm, DeleteConfirm } from '@/components/schedule-entry-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import {
    EQUIPMENT_STATUS_OPTIONS as STATUS_OPTIONS,
    EQUIPMENT_STATUS_LABEL as STATUS_LABEL,
} from '@/constants/equipmentStatus';
import type { EquipmentDateStatus } from '@/store/schemas/equipment';

import { useStatusScheduleContext } from './context';
import { fmtDate, type SchedulableStatus } from './constants';

type FormState = {
    statusType: SchedulableStatus;
    startDatetime: string;
    endDatetime: string;
    notes: string;
};

function StatusFormBody({
    editing,
    initial,
}: {
    editing: EquipmentDateStatus | null;
    initial?: { start: string; end: string };
}) {
    const { saveEntry, isSaving, closeMode } = useStatusScheduleContext();

    const [form, setForm] = useState<FormState>(() =>
        editing
            ? {
                  statusType: editing.statusType as SchedulableStatus,
                  startDatetime: editing.startDatetime,
                  endDatetime: editing.endDatetime,
                  notes: editing.notes ?? '',
              }
            : { statusType: 'MAINTENANCE', startDatetime: initial?.start ?? '', endDatetime: initial?.end ?? '', notes: '' },
    );

    const canSubmit = !!form.statusType && !!form.startDatetime && !!form.endDatetime;

    return (
        <ScheduleEntryForm
            title={editing ? 'Edit Status Entry' : 'Add Status Entry'}
            startDate={form.startDatetime}
            endDate={form.endDatetime}
            notes={form.notes}
            onStartChange={(d) => setForm((p) => ({ ...p, startDatetime: d, endDatetime: p.endDatetime && p.endDatetime < d ? '' : p.endDatetime }))}
            onEndChange={(d) => setForm((p) => ({ ...p, endDatetime: d }))}
            onNotesChange={(n) => setForm((p) => ({ ...p, notes: n }))}
            onSubmit={() =>
                void saveEntry(
                    {
                        statusType: form.statusType,
                        startDatetime: form.startDatetime,
                        endDatetime: form.endDatetime,
                        notes: form.notes || undefined,
                    },
                    editing?.id,
                )
            }
            onCancel={closeMode}
            isPending={isSaving}
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

function StatusDeleteBody({ entry }: { entry: EquipmentDateStatus }) {
    const { deleteEntry, isDeleting, closeMode } = useStatusScheduleContext();
    return (
        <DeleteConfirm
            title="Remove this status entry?"
            description={
                <>
                    <span className="font-medium text-foreground">{STATUS_LABEL[entry.statusType]}</span>
                    {' · '}
                    {fmtDate(entry.startDatetime)} – {fmtDate(entry.endDatetime)}
                </>
            }
            onDelete={() => void deleteEntry(entry.id)}
            onCancel={closeMode}
            isPending={isDeleting}
        />
    );
}

export function StatusScheduleEntryDialog() {
    const { mode, closeMode } = useStatusScheduleContext();
    const open = mode.type === 'add' || mode.type === 'manage';

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) closeMode(); }}>
            <DialogContent className="sm:max-w-md">
                {mode.type === 'add' && (
                    <>
                        <DialogTitle className="sr-only">Add Status Entry</DialogTitle>
                        <StatusFormBody
                            editing={null}
                            initial={{ start: mode.start ?? '', end: mode.end ?? '' }}
                        />
                    </>
                )}
                {mode.type === 'manage' && (
                    <>
                        <DialogTitle className="sr-only">Manage Status Entry</DialogTitle>
                        <Tabs defaultValue="edit">
                            <PrimaryTabsList className="w-full">
                                <PrimaryTabsTrigger value="edit" className="flex-1">Edit</PrimaryTabsTrigger>
                                <PrimaryTabsTrigger value="delete" className="flex-1">Delete</PrimaryTabsTrigger>
                            </PrimaryTabsList>
                            <TabsContent value="edit" className="mt-3">
                                <StatusFormBody key={mode.entry.id} editing={mode.entry} />
                            </TabsContent>
                            <TabsContent value="delete" className="mt-3">
                                <StatusDeleteBody entry={mode.entry} />
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
