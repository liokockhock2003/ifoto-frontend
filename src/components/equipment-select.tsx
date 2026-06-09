import { useState } from 'react';
import { Clock, Minus, MoreHorizontal, Plus } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { BoundaryNote, SubBoundaryNote, MainEquipment, SubEquipment } from '@/store/schemas/equipment';

function fmtDatetime(dt: string) {
    const d = new Date(dt);
    const date = d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
    const time = d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    return `${date}, ${time}`;
}

function BoundaryNotesHover({ notes }: { notes: BoundaryNote[] }) {
    const groupMap = new Map<string, BoundaryNote[]>();
    notes.forEach((note) => {
        const key = note.rentalId != null
            ? `rental-${note.rentalId}`
            : `status-${note.statusId ?? 'none'}`;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(note);
    });

    const earliest = (group: BoundaryNote[]) =>
        Math.min(...group.flatMap((n) =>
            [n.availableAfter, n.mustReturnBefore]
                .filter(Boolean)
                .map((d) => new Date(d!).getTime()),
        ));

    const sortedGroups = [...groupMap.values()].sort((a, b) => earliest(a) - earliest(b));

    return (
        <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
                <button type="button" className="flex items-center gap-0.5 text-[10px] text-amber-600 mt-0.5 hover:text-amber-700 transition-colors">
                    <Clock className="h-2.5 w-2.5 shrink-0" />
                    <span>Partially available</span>
                    <MoreHorizontal className="h-2.5 w-2.5 shrink-0" />
                </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 p-2 space-y-2">
                {sortedGroups.map((group, i) => (
                    <Card key={i} className="shadow-none">
                        <CardContent className="p-3 space-y-1 text-xs text-foreground">
                            {group.map((note, j) => (
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
}

function SubBoundaryNotesHover({ notes }: { notes: SubBoundaryNote[] }) {
    const groupMap = new Map<string, SubBoundaryNote[]>();
    notes.forEach((note) => {
        const key = note.rentalId != null ? `rental-${note.rentalId}` : `hold-${note.holdId ?? 'none'}`;
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(note);
    });

    const earliest = (group: SubBoundaryNote[]) =>
        Math.min(...group.flatMap((n) =>
            [n.availableAfter, n.mustReturnBefore]
                .filter(Boolean)
                .map((d) => new Date(d!).getTime()),
        ));

    const sortedGroups = [...groupMap.values()].sort((a, b) => earliest(a) - earliest(b));

    return (
        <HoverCard openDelay={150} closeDelay={100}>
            <HoverCardTrigger asChild>
                <button type="button" className="flex items-center gap-0.5 text-[10px] text-amber-600 mt-0.5 hover:text-amber-700 transition-colors">
                    <Clock className="h-2.5 w-2.5 shrink-0" />
                    <span>Partially available</span>
                    <MoreHorizontal className="h-2.5 w-2.5 shrink-0" />
                </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 p-2 space-y-2">
                {sortedGroups.map((group, i) => (
                    <Card key={i} className="shadow-none">
                        <CardContent className="p-3 space-y-1 text-xs text-foreground">
                            {group.map((note, j) => (
                                <div key={j} className="space-y-0.5">
                                    <p className="font-medium">Qty in use: {note.quantity}</p>
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
}

export type ItemInfo = {
    mainEquipmentId: number;
    equipmentType: string;
    brand: string | null;
    model: string | null;
    serialNumber: string | null;
};

export type SubItemInfo = {
    subEquipmentId: number;
    equipmentType: string;
    brand: string | null;
    borrowedQuantity?: number;
};

type EquipmentSelectProps = {
    value: number[];
    onChange: (ids: number[]) => void;
    requestedItems: ItemInfo[];
    requestedSubItems: SubItemInfo[];
    availableEquipment: MainEquipment[];
    availableSubEquipment: SubEquipment[];
    isLoading?: boolean;
    subQty?: Record<number, number>;
    onSubQtyChange?: (qty: Record<number, number>) => void;
};

export function EquipmentSelect({
    value,
    onChange,
    requestedItems,
    requestedSubItems,
    availableEquipment,
    availableSubEquipment,
    isLoading,
    subQty: controlledSubQty,
    onSubQtyChange,
}: EquipmentSelectProps) {
    const [internalSubQty, setInternalSubQty] = useState<Record<number, number>>({});
    const subQty = controlledSubQty ?? internalSubQty;

    function setSubQty(id: number, qty: number) {
        const next = { ...subQty, [id]: qty };
        if (onSubQtyChange) onSubQtyChange(next);
        else setInternalSubQty(next);
    }

    // ── Build label lookup across both sources ──────────────────────────────
    const subLabelMap = new Map<number, string>();
    requestedSubItems.forEach((item) => {
        subLabelMap.set(
            item.subEquipmentId,
            item.brand ? `${item.brand} ${item.equipmentType}` : item.equipmentType,
        );
    });
    availableSubEquipment.forEach((e) => {
        if (!subLabelMap.has(e.subEquipmentId)) {
            subLabelMap.set(
                e.subEquipmentId,
                e.brand ? `${e.brand} ${e.equipmentType}` : e.equipmentType,
            );
        }
    });

    const requestedSubIds = new Set(requestedSubItems.map((i) => i.subEquipmentId));

    // Build a requested-qty lookup so Available Accessories can base + from the right starting point
    const requestedQtyMap = new Map<number, number>();
    requestedSubItems.forEach((item) => {
        requestedQtyMap.set(item.subEquipmentId, item.borrowedQuantity ?? 1);
    });

    // Effective qty for any sub-equipment id:
    // explicit subQty takes priority; otherwise use requested qty (for originally-requested items) or 0
    function getEffectiveQty(id: number): number {
        if (subQty[id] !== undefined) return subQty[id];
        return requestedQtyMap.get(id) ?? 0;
    }

    // Approved accessories: originally-requested with effective qty > 0, plus committee-added extras
    const approvedItems: Array<{ id: number; label: string; requested?: number; approved: number }> = [];
    requestedSubItems.forEach((item) => {
        const approved = getEffectiveQty(item.subEquipmentId);
        if (approved > 0) {
            approvedItems.push({
                id: item.subEquipmentId,
                label: subLabelMap.get(item.subEquipmentId) ?? item.equipmentType,
                requested: item.borrowedQuantity,
                approved,
            });
        }
    });
    Object.entries(subQty).forEach(([idStr, qty]) => {
        const id = Number(idStr);
        if (qty > 0 && !requestedSubIds.has(id)) {
            approvedItems.push({
                id,
                label: subLabelMap.get(id) ?? `Accessory #${id}`,
                approved: qty,
            });
        }
    });

    // Available Accessories shows all available sub-equipment (including originally-requested ones)
    const addableSubEquipment = availableSubEquipment;

    // ── Main equipment helpers ──────────────────────────────────────────────
    const itemLookup = new Map<number, ItemInfo>();
    requestedItems.forEach((i) => itemLookup.set(i.mainEquipmentId, i));
    availableEquipment.forEach((e) => {
        if (!itemLookup.has(e.mainEquipmentId)) {
            itemLookup.set(e.mainEquipmentId, {
                mainEquipmentId: e.mainEquipmentId,
                equipmentType: e.equipmentType,
                brand: e.brand,
                model: e.model,
                serialNumber: e.serialNumber,
            });
        }
    });

    // Boundary notes lookup — keyed by mainEquipmentId from the availability response
    const boundaryNotesLookup = new Map<number, NonNullable<(typeof availableEquipment)[number]['boundaryNotes']>>();
    availableEquipment.forEach((e) => {
        if (e.boundaryNotes?.length) boundaryNotesLookup.set(e.mainEquipmentId, e.boundaryNotes);
    });

    const addableEquipment = availableEquipment.filter((e) => !value.includes(e.mainEquipmentId));

    function remove(id: number) {
        onChange(value.filter((v) => v !== id));
    }

    function add(id: number) {
        onChange([...value, id]);
    }

    return (
        <div className="space-y-3">
            {/* ── Row 1: Available Equipment (left) | Selected Equipment (right) ── */}
            <div className="grid grid-cols-2 gap-3">
                {/* Available Equipment */}
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">Available Equipment</p>
                    {isLoading ? (
                        <div className="space-y-1.5">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-9 w-full rounded-md" />
                            ))}
                        </div>
                    ) : addableEquipment.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center border rounded-md min-h-[40px] flex items-center justify-center bg-muted/40">
                            No other equipment available.
                        </p>
                    ) : (
                        <ScrollArea className="h-40 rounded-md border bg-muted/40">
                            <div className="divide-y pr-2">
                                {addableEquipment.map((e) => (
                                    <div key={e.mainEquipmentId} className="flex items-center justify-between px-2 py-1.5 gap-1">
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium">
                                                {e.equipmentType} · {e.brand} {e.model}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{e.serialNumber ?? '—'}</p>
                                            {e.boundaryNotes?.length ? <BoundaryNotesHover notes={e.boundaryNotes} /> : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => add(e.mainEquipmentId)}
                                            className="shrink-0 p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Selected Equipment */}
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                        Selected Equipment ({value.length})
                    </p>
                    {value.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center border rounded-md min-h-[40px] flex items-center justify-center">
                            No equipment selected.
                        </p>
                    ) : (
                        <ScrollArea className="h-40 rounded-md border bg-background">
                            <div className="divide-y pr-3">
                                {value.map((id) => {
                                    const info = itemLookup.get(id);
                                    return (
                                        <div key={id} className="flex items-center justify-between px-2 py-1.5 gap-1">
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium">
                                                    {info
                                                        ? `${info.equipmentType} · ${info.brand} ${info.model}`
                                                        : `Equipment #${id}`}
                                                </p>
                                                {info?.serialNumber && (
                                                    <p className="text-xs text-muted-foreground">{info.serialNumber}</p>
                                                )}
                                                {(() => { const notes = boundaryNotesLookup.get(id); return notes?.length ? <BoundaryNotesHover notes={notes} /> : null; })()}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => remove(id)}
                                                className="shrink-0 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </div>

            {/* ── Row 2: Available Accessories (left) | Requested Accessories (right) ── */}
            <div className="grid grid-cols-2 gap-3">
                {/* Available Accessories */}
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">Available Accessories</p>
                    {isLoading ? (
                        <div className="space-y-1.5">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-9 w-full rounded-md" />
                            ))}
                        </div>
                    ) : addableSubEquipment.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center border rounded-md min-h-[40px] flex items-center justify-center bg-muted/40">
                            No accessories available.
                        </p>
                    ) : (
                        <ScrollArea className="h-40 rounded-md border bg-muted/40">
                            <div className="divide-y pr-3">
                                {addableSubEquipment.map((e) => {
                                    const qty = getEffectiveQty(e.subEquipmentId);
                                    const partialQty = e.boundaryNotes?.reduce((sum, n) => sum + n.quantity, 0) ?? 0;
                                    const maxQty = e.availableQuantity + partialQty;
                                    return (
                                        <div key={e.subEquipmentId} className="flex items-center justify-between px-2 py-1.5 gap-1">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium">
                                                    {e.brand ? `${e.brand} ${e.equipmentType}` : e.equipmentType}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Available: {e.availableQuantity} / {e.totalQuantity}
                                                </p>
                                                {e.boundaryNotes?.length ? <SubBoundaryNotesHover notes={e.boundaryNotes} /> : null}
                                            </div>
                                            <button
                                                type="button"
                                                disabled={qty >= maxQty}
                                                onClick={() => setSubQty(e.subEquipmentId, qty + 1)}
                                                className="shrink-0 p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* Requested Accessories */}
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground">
                        Requested Accessories ({approvedItems.length})
                    </p>
                    {approvedItems.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center border rounded-md min-h-[40px] flex items-center justify-center">
                            No accessories requested.
                        </p>
                    ) : (
                        <ScrollArea className="h-40 rounded-md border bg-background">
                            <div className="divide-y pr-3">
                                {approvedItems.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between px-2 py-1.5 gap-1">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium">{item.label}</p>
                                            {item.requested != null && (
                                                <p className="text-[10px] text-muted-foreground">Requested: {item.requested}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setSubQty(item.id, item.approved - 1)}
                                                className="p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-5 text-center text-xs font-medium tabular-nums">
                                                {item.approved}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </div>
        </div>
    );
}
