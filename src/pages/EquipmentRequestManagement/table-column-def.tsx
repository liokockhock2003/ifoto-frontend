import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { EquipmentRequest, RequestStatus } from '@/store/schemas/request';
import { STATUS_LABEL, STATUS_VARIANT } from '@/pages/EventManagement/EquipmentRequestList/utils';

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
            const { variant, className } = STATUS_VARIANT[s] ?? { variant: 'outline' as const, className: '' };
            return (
                <Badge variant={variant} className={className}>
                    {STATUS_LABEL[s] ?? s.replace(/_/g, ' ')}
                </Badge>
            );
        },
    }),
    columnHelper.accessor('requestedStartDate', {
        header: 'Start Date',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('requestedEndDate', {
        header: 'End Date',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('createdAt', {
        header: 'Submitted',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => <RequestRowActions row={row} />,
    }),
];
