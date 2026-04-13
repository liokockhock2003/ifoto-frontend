import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <Card className="w-full max-w-lg overflow-y-auto max-h-[90vh]">
                <CardHeader>
                    <CardTitle>Edit Event</CardTitle>
                    <CardDescription>
                        Updating{' '}
                        <span className="font-medium text-foreground">{event?.eventName ?? '—'}</span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Event Name</Label>
                        <Input value={form.eventName ?? ''} onChange={set('eventName')} />
                    </div>
                    <div className="space-y-1">
                        <Label>Start Date</Label>
                        <Input type="date" value={form.startDate ?? ''} onChange={set('startDate')} />
                    </div>
                    <div className="space-y-1">
                        <Label>End Date</Label>
                        <Input type="date" value={form.endDate ?? ''} onChange={set('endDate')} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Location</Label>
                        <Input value={form.location ?? ''} onChange={set('location')} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Description</Label>
                        <Input
                            placeholder="Optional description"
                            value={form.description ?? ''}
                            onChange={set('description')}
                        />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                        <Label>Committee Members</Label>
                        <CommitteeUserSelect
                            value={form.committeeUserIds ?? []}
                            onChange={(ids) => setForm((prev) => ({ ...prev, committeeUserIds: ids }))}
                        />
                    </div>
                </CardContent>

                <CardFooter className="justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={mutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="button" disabled={!canSubmit} onClick={() => void handleSave()}>
                        {mutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
