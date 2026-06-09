import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Rental, RentalItem, RentalSubItem } from '@/store/schemas/rental';
import { RENTAL_STATUS_LABEL, type RentalStatus } from '@/constants/rentalStatus';
import { PAYMENT_STATUS_LABEL, PAYMENT_METHOD_LABEL } from '@/constants/paymentStatus';
import { statusVariant } from './table-column-def';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(cents: number) {
    return `RM ${(cents / 100).toFixed(2)}`;
}

function fmtDate(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function fmtDatetime(dt: string | null) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const FIELD_LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const FIELD_VALUE_CLASS = 'text-sm font-medium text-foreground';

const itemColumns: ColumnDef<RentalItem>[] = [
    {
        accessorKey: 'model',
        header: 'Equipment',
        cell: ({ row }) => (
            <div>
                <p className="font-medium">{row.original.brand} {row.original.model}</p>
                <p className="text-xs text-muted-foreground font-mono">{row.original.serialNumber ?? '—'}</p>
            </div>
        ),
    },
    { accessorKey: 'equipmentType', header: 'Type', cell: ({ row }) => <span className="text-muted-foreground">{row.original.equipmentType}</span> },
    {
        accessorKey: 'baseAmount',
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
            <div className="text-right">
                <p>{fmt(row.original.baseAmount)}</p>
                {row.original.latePenaltyAmount > 0 && (
                    <p className="text-xs text-destructive">+{fmt(row.original.latePenaltyAmount)} penalty</p>
                )}
            </div>
        ),
    },
];

const subItemColumns: ColumnDef<RentalSubItem>[] = [
    {
        accessorKey: 'equipmentType',
        header: 'Accessory',
        cell: ({ row }) => <p className="font-medium">{row.original.brand ? `${row.original.brand} ` : ''}{row.original.equipmentType}</p>,
    },
    {
        accessorKey: 'borrowedQuantity',
        header: () => <div className="text-right">Qty</div>,
        cell: ({ row }) => <div className="text-right text-muted-foreground">{row.original.borrowedQuantity}</div>,
    },
    {
        accessorKey: 'itemTotalAmount',
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) =>
            row.original.itemTotalAmount != null ? (
                <div className="text-right">
                    <p>{fmt(row.original.itemTotalAmount)}</p>
                    {(row.original.latePenaltyAmount ?? 0) > 0 && (
                        <p className="text-xs text-destructive">+{fmt(row.original.latePenaltyAmount!)} penalty</p>
                    )}
                </div>
            ) : (
                <div className="text-right">—</div>
            ),
    },
];

// ── RentalViewDialog ──────────────────────────────────────────────────────────

type RentalViewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function RentalViewDialog({ open, onOpenChange, rental }: RentalViewDialogProps) {
    if (!rental) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-base text-primary">{rental.rentalNumber}</span>
                        <Badge variant="outline" className={statusVariant(rental.status)}>
                            {RENTAL_STATUS_LABEL[rental.status as RentalStatus] ?? rental.status.replace(/_/g, ' ')}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        {/* Info grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Submitted</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{new Date(rental.createdAt).toLocaleString('en-MY')}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Renter</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{rental.renterUsername}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Payment Method</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{PAYMENT_METHOD_LABEL[rental.paymentMethod] ?? rental.paymentMethod}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Payment Status</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{PAYMENT_STATUS_LABEL[rental.paymentStatus] ?? rental.paymentStatus}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Program Start</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{fmtDate(rental.programStartDate)}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Program End</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{fmtDate(rental.programEndDate)}</FieldDescription>
                            </Field>
                            {rental.durationDays !== null && (
                                <Field className="gap-0.5">
                                    <FieldLabel className={FIELD_LABEL_CLASS}>Duration</FieldLabel>
                                    <FieldDescription className={FIELD_VALUE_CLASS}>{`${rental.durationDays} day${rental.durationDays !== 1 ? 's' : ''}`}</FieldDescription>
                                </Field>
                            )}
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Pickup Schedule</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{fmtDatetime(rental.pickupDatetime)}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Return Schedule</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{fmtDatetime(rental.returnDatetime)}</FieldDescription>
                            </Field>
                            {rental.pickedUpAt && (
                                <Field className="gap-0.5">
                                    <FieldLabel className={FIELD_LABEL_CLASS}>Picked Up At</FieldLabel>
                                    <FieldDescription className={FIELD_VALUE_CLASS}>{fmtDatetime(rental.pickedUpAt)}</FieldDescription>
                                </Field>
                            )}
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Base Amount</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{fmt(rental.totalBaseAmount)}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Penalty</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{fmt(rental.totalPenaltyAmount)}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Total</FieldLabel>
                                <FieldDescription className="text-sm font-semibold text-primary">{fmt(rental.totalAmount)}</FieldDescription>
                            </Field>
                        </div>

                        {/* Notes */}
                        {rental.renterNotes && (
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Your Notes</FieldLabel>
                                <FieldDescription className="text-sm text-foreground rounded-md bg-muted px-3 py-2 whitespace-pre-wrap">{rental.renterNotes}</FieldDescription>
                            </Field>
                        )}
                        {rental.committeeNotes && (
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Committee Notes</FieldLabel>
                                <FieldDescription className="text-sm text-foreground rounded-md bg-muted px-3 py-2 whitespace-pre-wrap">{rental.committeeNotes}</FieldDescription>
                            </Field>
                        )}
                        {rental.rejectionReason && (
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Rejection Reason</FieldLabel>
                                <FieldDescription className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 whitespace-pre-wrap">{rental.rejectionReason}</FieldDescription>
                            </Field>
                        )}

                        {/* Items */}
                        <DataTable
                            columns={itemColumns}
                            data={rental.items}
                            title="Equipment"
                            totalElements={rental.items.length}
                            emptyMessage="No equipment"
                            headerActions={<></>}
                        />

                        {/* Sub-items */}
                        {(rental.subItems ?? []).length > 0 && (
                            <DataTable
                                columns={subItemColumns}
                                data={rental.subItems!}
                                title="Accessories"
                                totalElements={(rental.subItems ?? []).length}
                                headerActions={<></>}
                            />
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
