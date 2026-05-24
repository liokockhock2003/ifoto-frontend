import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { EquipmentRequest, RequestStatus } from '@/store/schemas/request';

import { EquipmentRequestRowActions } from './table-row-actions';
import { formatDateRange, STATUS_LABEL, STATUS_VARIANT } from './utils';

const col = createColumnHelper<EquipmentRequest>();

export const requestColumns: ColumnDef<EquipmentRequest, any>[] = [
    col.accessor('requestNumber', {
        header: 'Request #',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    col.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const status = info.getValue() as RequestStatus;
            const { variant, className } = STATUS_VARIANT[status] ?? { variant: 'outline', className: '' };
            return (
                <Badge variant={variant} className={className}>
                    {STATUS_LABEL[status] ?? status}
                </Badge>
            );
        },
    }),
    col.accessor('requestedByUsername', {
        header: 'Requested By',
        cell: (info) => info.getValue(),
    }),
    col.display({
        id: 'requestedDates',
        header: 'Requested Dates',
        cell: ({ row }) =>
            formatDateRange(row.original.requestedStartDate, row.original.requestedEndDate),
    }),
    col.display({
        id: 'approvedDates',
        header: 'Approved Dates',
        cell: ({ row }) =>
            formatDateRange(row.original.approvedStartDate, row.original.approvedEndDate),
    }),
    col.accessor('items', {
        header: 'Items',
        cell: (info) => {
            const count = info.getValue().length;
            return <span className="text-sm text-muted-foreground">{count} {count === 1 ? 'item' : 'items'}</span>;
        },
    }),
    col.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <EquipmentRequestRowActions row={row} />,
    }),
];

export { formatDateRange, STATUS_LABEL, STATUS_VARIANT } from './utils';
