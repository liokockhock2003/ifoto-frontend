import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/date-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { CommitteeUserSelect } from '@/components/committee-user-select';
import { useUpdateEvent } from '@/store/queries/event';
import type { Event, UpdateEventPayload } from '@/store/schemas/event';

type EventEditDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    event: Event | null;
};

function toForm(event: Event | null): Omit<UpdateEventPayload, 'id'> {
    return {
        eventName: event?.eventName ?? '',
        description: event?.description ?? '',
        startDate: event?.startDate ?? '',
        endDate: event?.endDate ?? '',
        location: event?.location ?? '',
        isActive: event?.isActive ?? true,
        committeeUserIds: event?.eventCommittee.map((m) => m.id) ?? [],
    };
}

export function EventEditDialog({ open, onOpenChange, event }: EventEditDialogProps) {
    const mutation = useUpdateEvent();
    const [form, setForm] = useState(() => toForm(event));

    useEffect(() => {
        setForm(toForm(event));
    }, [event, open]);

    const set =
        (field: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setVal = (field: keyof typeof form) =>
        (value: string) =>
            setForm((prev) => ({ ...prev, [field]: value }));

    const canSubmit =
        !mutation.isPending &&
        !!event &&
        (form.eventName ?? '').trim() !== '' &&
        form.startDate !== '' &&
        form.endDate !== '' &&
        (form.location ?? '').trim() !== '';

    async function handleSave() {
        if (!event) return;
        try {
            await mutation.mutateAsync({ ...form, id: event.eventId });
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update event');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-muted-foreground">
                <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                    <DialogDescription>
                        Updating{' '}
                        <span className="font-medium text-foreground">{event?.eventName ?? '—'}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field className="sm:col-span-2">
                        <FieldLabel>Event Name</FieldLabel>
                        <Input value={form.eventName ?? ''} onChange={set('eventName')} />
                    </Field>
                    <Field>
                        <FieldLabel>Start Date</FieldLabel>
                        <DatePicker value={form.startDate ?? ''} onChange={setVal('startDate')} />
                    </Field>
                    <Field>
                        <FieldLabel>End Date</FieldLabel>
                        <DatePicker value={form.endDate ?? ''} onChange={setVal('endDate')} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Location</FieldLabel>
                        <Input value={form.location ?? ''} onChange={set('location')} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Description</FieldLabel>
                        <Input
                            placeholder="Optional description"
                            value={form.description ?? ''}
                            onChange={set('description')}
                        />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Committee Members</FieldLabel>
                        <CommitteeUserSelect
                            value={form.committeeUserIds ?? []}
                            onChange={(ids) => setForm((prev) => ({ ...prev, committeeUserIds: ids }))}
                        />
                    </Field>
                </div>

                <DialogFooter>
                    <Button
                        className="text-muted-foreground"
                        type="button"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
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
