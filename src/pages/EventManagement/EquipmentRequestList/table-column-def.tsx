import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { EquipmentRequest, RequestStatus } from '@/store/schemas/request';

import { REQUEST_STATUS_BADGE, REQUEST_STATUS_LABEL } from '@/constants/requestStatus';
import { EquipmentRequestRowActions } from './table-row-actions';
import { formatDateRange } from './utils';

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
            return (
                <Badge variant="outline" className={REQUEST_STATUS_BADGE[status] ?? ''}>
                    {REQUEST_STATUS_LABEL[status] ?? status}
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
    col.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <EquipmentRequestRowActions row={row} />,
    }),
];

export { formatDateRange } from './utils';
export { REQUEST_STATUS_LABEL as STATUS_LABEL, REQUEST_STATUS_BADGE as STATUS_VARIANT } from '@/constants/requestStatus';
