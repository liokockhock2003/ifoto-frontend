import { useState } from 'react';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { CalendarDays, CalendarX2, ChevronRight, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getRoleLabel, isCommitteeRole, isMembershipRole } from '@/constants/roles';
import { useEventsByCommittee } from '@/store/queries/event';
import type { Event } from '@/store/schemas/event';
import type { User } from '@/store/schemas/user';

import { UserTableRowActions } from './table-row-actions';

function fmtEventDate(iso: string | undefined | null) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EventCard({ event }: { event: Event }) {
    return (
        <div className="rounded-lg border bg-card p-3 transition-colors border-foreground hover:border-primary/40 hover:bg-accent/40">
            <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{event.eventName}</p>
                <Badge
                    variant="outline"
                    className={event.isActive ? 'badge-success' : 'text-muted-foreground'}
                >
                    {event.isActive ? 'Active' : 'Inactive'}
                </Badge>
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0" />
                    {fmtEventDate(event.startDatetime)} – {fmtEventDate(event.endDatetime)}
                </p>
                <p className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0" />
                    {event.location}
                </p>
            </div>
        </div>
    );
}

function EventCommitteeBadge({ userId }: { userId: number }) {
    const [open, setOpen] = useState(false);
    const { data, isLoading } = useEventsByCommittee(userId, { enabled: open });
    const count = data?.length ?? 0;

    return (
        <>
            <Badge
                variant="secondary"
                interactive
                role="button"
                tabIndex={0}
                onClick={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
            >
                <CalendarDays />
                {getRoleLabel('ROLE_EVENT_COMMITTEE')}
                <ChevronRight className="opacity-60" />
            </Badge>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md text-foreground">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-primary" />
                            Assigned Events
                            {!isLoading && count > 0 && (
                                <Badge variant="secondary" className="ml-1">{count}</Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Events this member is assigned to as Event Committee.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading && (
                        <div className="space-y-2">
                            {[0, 1].map((i) => (
                                <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted/40" />
                            ))}
                        </div>
                    )}

                    {!isLoading && count === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
                            <CalendarX2 className="size-7 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No events assigned.</p>
                        </div>
                    )}

                    {!isLoading && count > 0 && (
                        <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                            {data!.map((event) => (
                                <EventCard key={event.eventId} event={event} />
                            ))}
                        </div>
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
    columnHelper.accessor((row) => row.roles, {
        id: 'membership',
        header: 'Membership',
        cell: (info) => {
            const roles: string[] = info.getValue() ?? [];
            const membership = roles.filter(isMembershipRole);
            if (!membership.length) return <span className="text-muted-foreground">-</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {membership.map((role) => (
                        <Badge key={role} variant="secondary">
                            {getRoleLabel(role)}
                        </Badge>
                    ))}
                </div>
            );
        },
    }),
    columnHelper.accessor((row) => ({ roles: row.roles, id: row.id }), {
        id: 'committee',
        header: 'Committee',
        cell: (info) => {
            const { roles, id }: { roles: string[]; id: number } = info.getValue();
            const committee = (roles ?? []).filter(isCommitteeRole);
            if (!committee.length) return <span className="text-muted-foreground">-</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {committee.map((role) =>
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
