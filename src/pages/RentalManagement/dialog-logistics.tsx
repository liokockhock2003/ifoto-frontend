import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DateTimePicker } from '@/components/date-time-picker';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
import { useUpdateLogistics } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

// Strip seconds from "YYYY-MM-DDTHH:mm:ss" → "YYYY-MM-DDTHH:mm" for the picker
function toPickerValue(dt: string | null | undefined): string {
    if (!dt) return '';
    return dt.length >= 16 ? dt.slice(0, 16) : dt;
}

// Append ":00" so the API receives "YYYY-MM-DDTHH:mm:ss"
function toApiValue(dt: string): string {
    return dt.length === 16 ? dt + ':00' : dt;
}

export function BookingLogisticsDialog({ open, onOpenChange, rental }: Props) {
    const mutation = useUpdateLogistics();

    const [pickupDatetime, setPickupDatetime] = useState('');
    const [returnDatetime, setReturnDatetime] = useState('');

    useEffect(() => {
        if (open) {
            setPickupDatetime(toPickerValue(rental?.pickupDatetime));
            setReturnDatetime(toPickerValue(rental?.returnDatetime));
        }
    }, [open, rental]);

    const canSubmit = !mutation.isPending && pickupDatetime !== '' && returnDatetime !== '';

    async function handleSave() {
        if (!rental) return;
        try {
            await mutation.mutateAsync({
                id: rental.id,
                pickupDatetime: toApiValue(pickupDatetime),
                returnDatetime: toApiValue(returnDatetime),
            });
            toast.success('Schedule updated');
            onOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update schedule');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Update Schedule{rental ? ` — ${rental.rentalNumber}` : ''}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <Field>
                        <FieldLabel>
                            Pickup Datetime
                            <span className="text-muted-foreground font-normal ml-1 text-xs">
                                (on or before program start)
                            </span>
                        </FieldLabel>
                        <DateTimePicker
                            value={pickupDatetime}
                            onChange={setPickupDatetime}
                            placeholder="Pick pickup date & time"
                            maxDate={rental?.programStartDate}
                            periodStart={rental?.programStartDate}
                            periodEnd={rental?.programEndDate}
                        />
                    </Field>

                    <Field>
                        <FieldLabel>
                            Return Datetime
                            <span className="text-muted-foreground font-normal ml-1 text-xs">
                                (on or after program end)
                            </span>
                        </FieldLabel>
                        <DateTimePicker
                            value={returnDatetime}
                            onChange={setReturnDatetime}
                            placeholder="Pick return date & time"
                            minDate={rental?.programEndDate}
                            periodStart={rental?.programStartDate}
                            periodEnd={rental?.programEndDate}
                        />
                    </Field>
                </div>

                <DialogFooter>
                    <Button variant="outline" className="text-muted-foreground" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button disabled={!canSubmit} onClick={() => void handleSave()}>
                        {mutation.isPending ? 'Saving…' : 'Save Schedule'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
