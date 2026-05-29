import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { RangeDatePicker } from '@/components/range-date-picker';
import { Textarea } from '@/components/ui/textarea';

// ── ScheduleEntryForm ─────────────────────────────────────────────────────────

type ScheduleEntryFormProps = {
    title: string;
    startDate: string;
    endDate: string;
    notes: string;
    onStartChange: (d: string) => void;
    onEndChange: (d: string) => void;
    onNotesChange: (n: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    isPending: boolean;
    canSubmit: boolean;
    submitLabel?: string;
    notesPlaeholder?: string;
    extraFields?: React.ReactNode;
};

export function ScheduleEntryForm({
    title,
    startDate,
    endDate,
    notes,
    onStartChange,
    onEndChange,
    onNotesChange,
    onSubmit,
    onCancel,
    isPending,
    canSubmit,
    submitLabel = 'Save',
    notesPlaeholder = 'Optional notes…',
    extraFields,
}: ScheduleEntryFormProps) {
    return (
        <div className="rounded-md border bg-muted/30 p-4 space-y-4 text-foreground">
            <p className="text-sm font-medium">{title}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {extraFields}
                <Field>
                    <FieldLabel>Notes (optional)</FieldLabel>
                    <Textarea
                        placeholder={notesPlaeholder}
                        value={notes}
                        onChange={(e) => onNotesChange(e.target.value)}
                        rows={2}
                        className="resize-none"
                    />
                </Field>
                <Field className="sm:col-span-2">
                    <FieldLabel>Date Range</FieldLabel>
                    <RangeDatePicker
                        startDate={startDate}
                        endDate={endDate}
                        onStartChange={onStartChange}
                        onEndChange={onEndChange}
                    />
                </Field>
            </div>
            <div className="flex gap-2">
                <Button type="button" size="sm" disabled={!canSubmit || isPending} onClick={onSubmit}>
                    {isPending ? 'Saving…' : submitLabel}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}

// ── DeleteConfirm ─────────────────────────────────────────────────────────────

type DeleteConfirmProps = {
    title: string;
    description: React.ReactNode;
    onDelete: () => void;
    onCancel: () => void;
    isPending: boolean;
    deleteLabel?: string;
};

export function DeleteConfirm({
    title,
    description,
    onDelete,
    onCancel,
    isPending,
    deleteLabel = 'Delete',
}: DeleteConfirmProps) {
    return (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 space-y-3 text-foreground">
            <p className="text-sm font-medium text-destructive">{title}</p>
            <div className="text-xs text-muted-foreground">{description}</div>
            <div className="flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={onDelete}
                >
                    {isPending ? 'Deleting…' : deleteLabel}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={isPending} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
