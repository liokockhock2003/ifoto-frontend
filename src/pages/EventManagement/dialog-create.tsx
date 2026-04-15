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
import { useCreateEvent } from '@/store/queries/event';
import type { CreateEventPayload } from '@/store/schemas/event';

type EventCreateDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const defaultForm = (): CreateEventPayload => ({
    eventName: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    isActive: true,
    committeeUserIds: [],
});

export function EventCreateDialog({ open, onOpenChange }: EventCreateDialogProps) {
    const mutation = useCreateEvent();
    const [form, setForm] = useState<CreateEventPayload>(defaultForm);

    useEffect(() => {
        if (open) setForm(defaultForm());
    }, [open]);

    const set =
        (field: keyof CreateEventPayload) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const setVal = (field: keyof CreateEventPayload) =>
        (value: string) =>
            setForm((prev) => ({ ...prev, [field]: value }));

    const canSubmit =
        !mutation.isPending &&
        form.eventName.trim() !== '' &&
        form.startDate !== '' &&
        form.endDate !== '' &&
        form.location.trim() !== '';

    async function handleSubmit() {
        try {
            await mutation.mutateAsync(form);
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create event');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-muted-foreground">
                <DialogHeader>
                    <DialogTitle>Create Event</DialogTitle>
                    <DialogDescription>Fill in the details for the new event.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field className="sm:col-span-2">
                        <FieldLabel>Event Name</FieldLabel>
                        <Input
                            placeholder="e.g. Night Photography Workshop"
                            value={form.eventName}
                            onChange={set('eventName')}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>Start Date</FieldLabel>
                        <DatePicker value={form.startDate} onChange={setVal('startDate')} />
                    </Field>
                    <Field>
                        <FieldLabel>End Date</FieldLabel>
                        <DatePicker value={form.endDate} onChange={setVal('endDate')} />
                    </Field>
                    <Field className="sm:col-span-2">
                        <FieldLabel>Location</FieldLabel>
                        <Input
                            placeholder="e.g. Titiwangsa Lake Garden, KL"
                            value={form.location}
                            onChange={set('location')}
                        />
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
                            value={form.committeeUserIds}
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
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
                        {mutation.isPending ? 'Creating...' : 'Create Event'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
