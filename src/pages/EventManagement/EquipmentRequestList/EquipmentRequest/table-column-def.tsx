import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { Clock, MoreHorizontal } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import { EQUIPMENT_CONDITION_BADGE } from '@/constants/equipmentCondition';
import { EQUIPMENT_STATUS_BADGE, EQUIPMENT_STATUS_LABEL } from '@/constants/equipmentStatus';

import { CartAddRemoveCell, SubEquipmentQuantityCell } from './table-row-actions';

function fmtDatetime(dt: string) {
    const d = new Date(dt);
    const date = d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    return `${date}, ${time}`;
}

// ── Main equipment columns (no pricing) ───────────────────────────────────────

const columnHelper = createColumnHelper<MainEquipment>();

export function createRequestEquipmentColumns(options?: { showLensType?: boolean }): ColumnDef<MainEquipment, any>[] {
    const showLensType = options?.showLensType ?? false;
    return [
        columnHelper.accessor('model', {
            header: 'Model',
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),
        ...(showLensType ? [columnHelper.accessor('lensType', {
            header: 'Lens Type',
            cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
        })] : []),
        columnHelper.accessor('condition', {
            header: 'Condition',
            cell: (info) => {
                const val = info.getValue();
                return <Badge variant="outline" className={EQUIPMENT_CONDITION_BADGE[val] ?? ''}>{val}</Badge>;
            },
        }),
        columnHelper.accessor('status', {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { status, boundaryNotes } = row.original;

                const badge = (
                    <Badge variant="outline" className={EQUIPMENT_STATUS_BADGE[status]}>
                        {EQUIPMENT_STATUS_LABEL[status]}
                    </Badge>
                );

                if (status !== 'PARTIALLY_AVAILABLE' || !boundaryNotes?.length) {
                    return badge;
                }

                const groupMap = new Map<string, typeof boundaryNotes>();
                boundaryNotes.forEach((note) => {
                    const key = note.rentalId != null
                        ? `rental-${note.rentalId}`
                        : `status-${note.statusId ?? 'none'}`;
                    if (!groupMap.has(key)) groupMap.set(key, []);
                    groupMap.get(key)!.push(note);
                });

                const earliest = (notes: typeof boundaryNotes) =>
                    Math.min(...notes.flatMap((n) =>
                        [n.availableAfter, n.mustReturnBefore]
                            .filter(Boolean)
                            .map((d) => new Date(d!).getTime()),
                    ));

                const sortedGroups = [...groupMap.values()].sort((a, b) => earliest(a) - earliest(b));

                return (
                    <HoverCard openDelay={100} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <Badge variant="outline" className={`${EQUIPMENT_STATUS_BADGE[status]} flex items-center gap-1 cursor-default w-fit`}>
                                {EQUIPMENT_STATUS_LABEL[status]}
                                <MoreHorizontal className="h-3 w-3 shrink-0" />
                            </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72 p-2 space-y-2">
                            {sortedGroups.map((notes, i) => (
                                <Card key={i} className="shadow-none">
                                    <CardContent className="p-3 space-y-1 text-xs text-foreground">
                                        {notes.map((note, j) => (
                                            <div key={j} className="space-y-0.5">
                                                {note.mustReturnBefore && (
                                                    <p className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        Must return by {fmtDatetime(note.mustReturnBefore)}
                                                    </p>
                                                )}
                                                {note.availableAfter && (
                                                    <p className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        Available from {fmtDatetime(note.availableAfter)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </HoverCardContent>
                    </HoverCard>
                );
            },
        }),
        columnHelper.display({
            id: 'action',
            header: '',
            cell: ({ row }) => <CartAddRemoveCell equipmentId={row.original.mainEquipmentId} />,
        }),
    ];
}

// ── Sub equipment columns (no pricing) ────────────────────────────────────────

const subColumnHelper = createColumnHelper<SubEquipment>();

export function createRequestSubEquipmentColumns(): ColumnDef<SubEquipment, any>[] {
    return [
        subColumnHelper.accessor('equipmentType', {
            header: 'Type',
            cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }),
        subColumnHelper.display({
            id: 'boundaryNotes',
            header: 'Partially Available',
            cell: ({ row }) => {
                const { boundaryNotes } = row.original;

                if (!boundaryNotes?.length) {
                    return <span className="text-muted-foreground">—</span>;
                }

                const groupMap = new Map<string, typeof boundaryNotes>();
                boundaryNotes.forEach((note) => {
                    const key = note.rentalId != null ? `rental-${note.rentalId}` : `hold-${note.holdId ?? 'none'}`;
                    if (!groupMap.has(key)) groupMap.set(key, []);
                    groupMap.get(key)!.push(note);
                });

                const earliest = (notes: typeof boundaryNotes) =>
                    Math.min(...notes.flatMap((n) =>
                        [n.availableAfter, n.mustReturnBefore]
                            .filter(Boolean)
                            .map((d) => new Date(d!).getTime()),
                    ));

                const sortedGroups = [...groupMap.values()].sort((a, b) => earliest(a) - earliest(b));

                return (
                    <HoverCard openDelay={100} closeDelay={100}>
                        <HoverCardTrigger asChild>
                            <Badge variant="outline" className="badge-warning flex items-center gap-1 cursor-default w-fit">
                                Partial
                                <MoreHorizontal className="h-3 w-3 shrink-0" />
                            </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-72 p-2 space-y-2">
                            {sortedGroups.map((notes, i) => (
                                <Card key={i} className="shadow-none">
                                    <CardContent className="p-3 space-y-1 text-xs text-foreground">
                                        {notes.map((note, j) => (
                                            <div key={j} className="space-y-0.5">
                                                <p className="font-medium">Quantity In Used: {note.quantity}</p>
                                                {note.mustReturnBefore && (
                                                    <p className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        Must return by {fmtDatetime(note.mustReturnBefore)}
                                                    </p>
                                                )}
                                                {note.availableAfter && (
                                                    <p className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3 shrink-0" />
                                                        Available from {fmtDatetime(note.availableAfter)}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </HoverCardContent>
                    </HoverCard>
                );
            },
        }),
        subColumnHelper.accessor('availableQuantity', {
            header: 'Fully Available',
            cell: (info) => {
                const val = info.getValue();
                return (
                    <span className={`font-medium ${val === 0 ? 'text-destructive' : 'text-primary'}`}>
                        {val} / {info.row.original.totalQuantity}
                    </span>
                );
            },
        }),
        subColumnHelper.display({
            id: 'quantity',
            header: 'Quantity',
            cell: ({ row }) => {
                const { subEquipmentId, availableQuantity, boundaryNotes } = row.original;
                const partialQty = boundaryNotes?.reduce((sum, n) => sum + n.quantity, 0) ?? 0;
                return (
                    <SubEquipmentQuantityCell
                        subEquipmentId={subEquipmentId}
                        maxQuantity={(availableQuantity ?? 0) + partialQty}
                    />
                );
            },
        }),
    ];
}
