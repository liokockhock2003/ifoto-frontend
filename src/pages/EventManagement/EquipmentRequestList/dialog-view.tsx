import type { ColumnDef } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EquipmentRequest, EquipmentRequestItem, EquipmentRequestSubItem } from '@/store/schemas/request';

import { REQUEST_STATUS_BADGE, REQUEST_STATUS_LABEL } from '@/constants/requestStatus';
import { formatDate, formatDateRange, formatDateTimeRange } from './utils';

type EquipmentRequestViewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

const FIELD_LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';
const FIELD_VALUE_CLASS = 'text-sm font-medium text-foreground';

const itemColumns: ColumnDef<EquipmentRequestItem>[] = [
    { accessorKey: 'equipmentType', header: 'Type' },
    { accessorKey: 'brand', header: 'Brand', cell: ({ row }) => row.original.brand ?? '—' },
    { accessorKey: 'model', header: 'Model', cell: ({ row }) => row.original.model ?? '—' },
    {
        accessorKey: 'serialNumber',
        header: 'Serial No.',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.serialNumber ?? '—'}</span>,
    },
];

const subItemColumns: ColumnDef<EquipmentRequestSubItem>[] = [
    { accessorKey: 'equipmentType', header: 'Type' },
    { accessorKey: 'brand', header: 'Brand', cell: ({ row }) => row.original.brand ?? '—' },
    {
        accessorKey: 'borrowedQuantity',
        header: () => <div className="text-right">Qty</div>,
        cell: ({ row }) => <div className="text-right">{row.original.borrowedQuantity ?? '—'}</div>,
    },
];

export function EquipmentRequestViewDialog({
    open,
    onOpenChange,
    request,
}: EquipmentRequestViewDialogProps) {
    if (!request) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl text-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <span className="font-mono text-base text-primary">{request.requestNumber}</span>
                        <Badge variant="outline" className={REQUEST_STATUS_BADGE[request.status] ?? ''}>
                            {REQUEST_STATUS_LABEL[request.status] ?? request.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Submitted {formatDate(request.createdAt)} · {request.eventName}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        {/* Info grid */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Requested By</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{request.requestedByUsername}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Reviewed By</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{request.reviewedByFullName ?? request.reviewedByUsername ?? '—'}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Event</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{request.eventName}</FieldDescription>
                            </Field>
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Event Duration</FieldLabel>
                                <FieldDescription className={FIELD_VALUE_CLASS}>{formatDateTimeRange(request.startDatetime, request.endDatetime)}</FieldDescription>
                            </Field>
                            {request.durationDays != null && (
                                <Field className="gap-0.5">
                                    <FieldLabel className={FIELD_LABEL_CLASS}>Duration</FieldLabel>
                                    <FieldDescription className={FIELD_VALUE_CLASS}>{`${request.durationDays} day${request.durationDays !== 1 ? 's' : ''}`}</FieldDescription>
                                </Field>
                            )}
                            {(request.pickupDatetime || request.returnDatetime) && (
                                <Field className="gap-0.5">
                                    <FieldLabel className={FIELD_LABEL_CLASS}>Logistics Window</FieldLabel>
                                    <FieldDescription className={FIELD_VALUE_CLASS}>{formatDateRange(request.pickupDatetime ?? '', request.returnDatetime ?? '')}</FieldDescription>
                                </Field>
                            )}
                            {request.approvedAt && (
                                <Field className="gap-0.5">
                                    <FieldLabel className={FIELD_LABEL_CLASS}>Approved At</FieldLabel>
                                    <FieldDescription className={FIELD_VALUE_CLASS}>{formatDate(request.approvedAt)}</FieldDescription>
                                </Field>
                            )}
                            {request.pickedUpAt && (
                                <Field className="gap-0.5">
                                    <FieldLabel className={FIELD_LABEL_CLASS}>Picked Up At</FieldLabel>
                                    <FieldDescription className={FIELD_VALUE_CLASS}>{formatDate(request.pickedUpAt)}</FieldDescription>
                                </Field>
                            )}
                        </div>

                        {/* Requester notes */}
                        {request.requesterNotes && (
                            <Field className="gap-0.5">
                                <FieldLabel className={FIELD_LABEL_CLASS}>Requester Notes</FieldLabel>
                                <FieldDescription className="text-sm text-foreground rounded-md bg-muted px-3 py-2">{request.requesterNotes}</FieldDescription>
                            </Field>
                        )}

                        {/* Rejection / committee notes */}
                        {(request.status === 'REJECTED' || request.committeeNotes) && (
                            <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
                                {request.rejectionReason && (
                                    <Field className="gap-0.5">
                                        <FieldLabel className={FIELD_LABEL_CLASS}>Rejection Reason</FieldLabel>
                                        <FieldDescription className={FIELD_VALUE_CLASS}>{request.rejectionReason}</FieldDescription>
                                    </Field>
                                )}
                                {request.committeeNotes && (
                                    <Field className="gap-0.5">
                                        <FieldLabel className={FIELD_LABEL_CLASS}>Committee Notes</FieldLabel>
                                        <FieldDescription className={FIELD_VALUE_CLASS}>{request.committeeNotes}</FieldDescription>
                                    </Field>
                                )}
                            </div>
                        )}

                        {/* Equipment items */}
                        <DataTable
                            columns={itemColumns}
                            data={request.items}
                            title="Equipment Items"
                            totalElements={request.items.length}
                            emptyMessage="No items"
                            headerActions={<></>}
                        />

                        {/* Accessories */}
                        {request.subItems.length > 0 && (
                            <DataTable
                                columns={subItemColumns}
                                data={request.subItems}
                                title="Accessories"
                                totalElements={request.subItems.length}
                                headerActions={<></>}
                            />
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
