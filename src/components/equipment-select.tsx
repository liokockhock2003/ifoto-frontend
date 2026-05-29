import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

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
                                            <p className="text-xs text-muted-foreground">{e.serialNumber}</p>
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
                                    return (
                                        <div key={e.subEquipmentId} className="flex items-center justify-between px-2 py-1.5 gap-1">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-medium">
                                                    {e.brand ? `${e.brand} ${e.equipmentType}` : e.equipmentType}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Available: {e.availableQuantity} / {e.totalQuantity}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                disabled={qty >= e.availableQuantity}
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
