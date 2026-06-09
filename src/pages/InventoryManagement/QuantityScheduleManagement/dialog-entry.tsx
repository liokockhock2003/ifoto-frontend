import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { ScheduleEntryForm, DeleteConfirm } from '@/components/schedule-entry-form';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import type { SubEquipmentQuantityHold } from '@/store/schemas/equipment';

import { useQuantityScheduleContext } from './context';
import { fmtDate } from './constants';

type HoldFormState = {
    quantity: number;
    startDatetime: string;
    endDatetime: string;
    notes: string;
};

function HoldFormBody({
    editing,
    initial,
}: {
    editing: SubEquipmentQuantityHold | null;
    initial?: { start: string; end: string };
}) {
    const { saveEntry, isSaving, closeMode } = useQuantityScheduleContext();

    const [form, setForm] = useState<HoldFormState>(() =>
        editing
            ? { quantity: editing.quantity, startDatetime: editing.startDatetime, endDatetime: editing.endDatetime, notes: editing.notes ?? '' }
            : { quantity: 1, startDatetime: initial?.start ?? '', endDatetime: initial?.end ?? '', notes: '' },
    );

    const canSubmit = form.quantity >= 1 && !!form.startDatetime && !!form.endDatetime;

    return (
        <ScheduleEntryForm
            title={editing ? 'Edit Schedule' : 'Add Schedule'}
            startDate={form.startDatetime}
            endDate={form.endDatetime}
            notes={form.notes}
            onStartChange={(d) => setForm((p) => ({ ...p, startDatetime: d, endDatetime: p.endDatetime && p.endDatetime < d ? '' : p.endDatetime }))}
            onEndChange={(d) => setForm((p) => ({ ...p, endDatetime: d }))}
            onNotesChange={(n) => setForm((p) => ({ ...p, notes: n }))}
            onSubmit={() =>
                void saveEntry(
                    {
                        quantity: form.quantity,
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

function HoldDeleteBody({ entry }: { entry: SubEquipmentQuantityHold }) {
    const { deleteEntry, isDeleting, closeMode } = useQuantityScheduleContext();
    return (
        <DeleteConfirm
            title="Remove this quantity schedule?"
            description={
                <>
                    <span className="font-medium text-foreground">
                        {entry.quantity} unit{entry.quantity !== 1 ? 's' : ''}
                    </span>
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

export function QuantityScheduleEntryDialog() {
    const { mode, closeMode } = useQuantityScheduleContext();
    const open = mode.type === 'add' || mode.type === 'manage';

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) closeMode(); }}>
            <DialogContent className="sm:max-w-md">
                {mode.type === 'add' && (
                    <>
                        <DialogTitle className="sr-only">Add Schedule</DialogTitle>
                        <HoldFormBody editing={null} initial={{ start: mode.start ?? '', end: mode.end ?? '' }} />
                    </>
                )}
                {mode.type === 'manage' && (
                    <>
                        <DialogTitle className="sr-only">Manage Schedule</DialogTitle>
                        <Tabs defaultValue="edit">
                            <PrimaryTabsList className="w-full">
                                <PrimaryTabsTrigger value="edit" className="flex-1">Edit</PrimaryTabsTrigger>
                                <PrimaryTabsTrigger value="delete" className="flex-1">Delete</PrimaryTabsTrigger>
                            </PrimaryTabsList>
                            <TabsContent value="edit" className="mt-3">
                                <HoldFormBody key={mode.entry.id} editing={mode.entry} />
                            </TabsContent>
                            <TabsContent value="delete" className="mt-3">
                                <HoldDeleteBody entry={mode.entry} />
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
