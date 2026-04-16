import { useState } from 'react';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getRoleLabel } from '@/constants/roles';
import { useEventsByCommittee } from '@/store/queries/event';
import type { User } from '@/store/schemas/user';

import { UserTableRowActions } from './table-row-actions';

function EventCommitteeBadge({ userId }: { userId: number }) {
    const [open, setOpen] = useState(false);
    const { data, isLoading } = useEventsByCommittee(userId, { enabled: open });

    return (
        <>
            <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => setOpen(true)}
            >
                {getRoleLabel('ROLE_EVENT_COMMITTEE')}
            </Badge>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md text-muted-foreground">
                    <DialogHeader>
                        <DialogTitle>Assigned Events</DialogTitle>
                    </DialogHeader>

                    {isLoading && (
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    )}

                    {!isLoading && (!data || data.length === 0) && (
                        <p className="text-sm text-muted-foreground">No events assigned.</p>
                    )}

                    {!isLoading && data && data.length > 0 && (
                        <ul className="divide-y">
                            {data.map((event) => (
                                <li key={event.eventId} className="py-2">
                                    <p className="text-sm font-medium">{event.eventName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {event.startDate} – {event.endDate} · {event.location}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

const columnHelper = createColumnHelper<User>();

export const userTableColumns: ColumnDef<User, any>[] = [
    columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('fullName', {
        header: 'Full Name',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('username', {
        header: 'Username',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => ({ roles: row.roles, id: row.id }), {
        id: 'roles',
        header: 'Roles',
        cell: (info) => {
            const { roles, id }: { roles: string[]; id: number } = info.getValue();
            if (!roles?.length) return <span className="text-muted-foreground">-</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((role) =>
                        role === 'ROLE_EVENT_COMMITTEE' ? (
                            <EventCommitteeBadge key={role} userId={id} />
                        ) : (
                            <Badge key={role} variant="secondary">
                                {getRoleLabel(role)}
                            </Badge>
                        )
                    )}
                </div>
            );
        },
    }),
    columnHelper.accessor('isLocked', {
        header: 'Status',
        cell: (info) => {
            const isLocked = info.getValue();
            return isLocked ? (
                <Badge variant="outline" className="badge-danger">Inactive</Badge>
            ) : (
                <Badge variant="outline" className="badge-success">Active</Badge>
            );
        },
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <UserTableRowActions row={row} />,
    }),
];
