import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { EquipmentRequest, RequestStatus } from '@/store/schemas/request';
import { REQUEST_STATUS_BADGE, REQUEST_STATUS_LABEL } from '@/constants/requestStatus';

import { RequestRowActions } from './table-row-actions';

const columnHelper = createColumnHelper<EquipmentRequest>();

export const requestManagementColumns: ColumnDef<EquipmentRequest, any>[] = [
    columnHelper.accessor('requestNumber', {
        header: 'Request No.',
        cell: (info) => <span className="font-medium font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('eventName', {
        header: 'Event',
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('requestedByUsername', {
        header: 'Requested By',
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const s = info.getValue() as RequestStatus;
            return (
                <Badge variant="outline" className={REQUEST_STATUS_BADGE[s] ?? ''}>
                    {REQUEST_STATUS_LABEL[s] ?? s.replace(/_/g, ' ')}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('startDatetime', {
        header: 'Start',
        cell: (info) => new Date(info.getValue()).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' }),
    }),
    columnHelper.accessor('endDatetime', {
        header: 'End',
        cell: (info) => new Date(info.getValue()).toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' }),
    }),
    columnHelper.accessor('createdAt', {
        header: 'Submitted',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <RequestRowActions row={row} />,
    }),
];
