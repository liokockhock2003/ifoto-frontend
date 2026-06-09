import { ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import type { CartLineItem } from '@/components/cart-summary';

type EquipmentRequestConfirmationDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending: boolean;
    cartIds: number[];
    subQty: Record<number, number>;
    mainEquipment: MainEquipment[];
    subEquipment: SubEquipment[];
    startDate: string;
    endDate: string;
    notes?: string;
    title?: string;
    submitLabel?: string;
    lineItems?: CartLineItem[];
};

function formatDate(iso: string) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}

function calcDays(start: string, end: string): number {
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

export function EquipmentRequestConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    isPending,
    cartIds,
    subQty,
    mainEquipment,
    subEquipment,
    startDate,
    endDate,
    notes,
    title = 'Submit Equipment Request',
    submitLabel = 'Confirm',
    lineItems,
}: EquipmentRequestConfirmationDialogProps) {
    const mainEquipmentMap = new Map(mainEquipment.map((e) => [e.mainEquipmentId, e]));
    const subEquipmentMap = new Map(subEquipment.map((e) => [e.subEquipmentId, e]));

    const subEntries = Object.entries(subQty)
        .filter(([, qty]) => qty > 0)
        .map(([idStr, qty]) => ({ id: Number(idStr), qty }));

    const rows: CartLineItem[] = lineItems ?? [
        ...cartIds.map((id) => {
            const eq = mainEquipmentMap.get(id);
            return {
                id: `main-${id}`,
                label: eq ? `${eq.brand} ${eq.model}` : `Equipment #${id}`,
                type: eq?.equipmentType ?? '—',
                qty: 1,
            };
        }),
        ...subEntries.map(({ id, qty }) => {
            const eq = subEquipmentMap.get(id);
            return {
                id: `sub-${id}`,
                label: eq ? (eq.brand ? `${eq.brand} ${eq.equipmentType}` : eq.equipmentType) : `Accessory #${id}`,
                type: 'Accessory',
                qty,
            };
        }),
    ];

    const hasPricing = rows.some((r) => r.price != null);
    const totalPrice = hasPricing && rows.every((r) => r.price != null)
        ? rows.reduce((sum, r) => sum + (r.price ?? 0), 0)
        : null;

    const days = startDate && endDate ? calcDays(startDate, endDate) : 0;
    const dateLabel = startDate && endDate
        ? `${formatDate(startDate)} – ${formatDate(endDate)} · ${days} day${days !== 1 ? 's' : ''}`
        : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        Please confirm the details below before submitting.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    {/* Date range */}
                    {dateLabel && (
                        <p className="text-xs text-muted-foreground">{dateLabel}</p>
                    )}

                    {/* Items table */}
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    {hasPricing && <TableHead className="text-right">Amount</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={hasPricing ? 4 : 3} className="text-center text-muted-foreground py-4">
                                            No items selected.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="font-medium">{row.label}</TableCell>
                                            <TableCell className="text-muted-foreground">{row.type ?? '—'}</TableCell>
                                            <TableCell className="text-right tabular-nums">{row.qty}</TableCell>
                                            {hasPricing && (
                                                <TableCell className="text-right tabular-nums">
                                                    {row.price != null ? `RM ${row.price.toFixed(2)}` : '—'}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                            {totalPrice != null && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={3} className="font-medium">Estimated Total</TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            RM {totalPrice.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                            )}
                        </Table>
                    </div>

                    {/* Notes */}
                    {notes && (
                        <div className="space-y-1 text-sm">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</p>
                            <p className="rounded-md border bg-muted/40 px-3 py-2">{notes}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        className="text-muted-foreground"
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="button" disabled={isPending} onClick={onConfirm}>
                        {isPending && <Spinner className="mr-1" />}
                        {isPending ? 'Submitting...' : submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
