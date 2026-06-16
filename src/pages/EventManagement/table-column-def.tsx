import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import type { Event } from '@/store/schemas/event';

import { EventRowActions } from './table-row-actions';

const col = createColumnHelper<Event>();

export const eventColumns: ColumnDef<Event, any>[] = [
    col.accessor('eventName', {
        header: 'Event Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    col.accessor('startDatetime', {
        header: 'Start',
        cell: (info) => formatDateTime(info.getValue()),
    }),
    col.accessor('endDatetime', {
        header: 'End',
        cell: (info) => formatDateTime(info.getValue()),
    }),
    col.accessor('location', {
        header: 'Location',
        cell: (info) => info.getValue(),
    }),
    col.accessor('isActive', {
        header: 'Status',
        cell: (info) => (
            <Badge variant="outline" className={info.getValue() ? 'badge-success' : 'badge-danger'}>
                {info.getValue() ? 'Active' : 'Inactive'}
            </Badge>
        ),
    }),
    col.accessor('eventCommittee', {
        header: 'Committee',
        cell: (info) => {
            const members = info.getValue();
            if (members.length === 0)
                return <span className="text-sm text-muted-foreground">—</span>;
            return (
                <span className="text-sm">{(members as { fullName: string }[]).map((m) => m.fullName).join(', ')}</span>
            );
        },
    }),
    col.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <EventRowActions row={row} />,
    }),
];
