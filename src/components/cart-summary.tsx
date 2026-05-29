import { ShoppingCart } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

export type CartLineItem = {
    id: string;
    label: string;
    type?: string;
    qty: number;
    price?: number | null;
};

type CartSummaryProps = {
    lineItems: CartLineItem[];
    totalItemCount: number;
    totalPrice?: number | null;
    startDate?: string | null;
    endDate?: string | null;
    notes: string;
    onNotesChange: (notes: string) => void;
    onSubmit: () => void;
    isPending?: boolean;
    error?: Error | null;
    submitLabel?: string;
    onCancel?: () => void;
    cancelLabel?: string;
    isSubmitDisabled?: boolean;
};

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}

function calcDays(start: string, end: string): number {
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

export function CartSummary({
    lineItems,
    totalItemCount,
    totalPrice,
    startDate,
    endDate,
    notes,
    onNotesChange,
    onSubmit,
    isPending = false,
    error,
    submitLabel = 'Submit',
    onCancel,
    cancelLabel = 'Cancel',
    isSubmitDisabled,
}: CartSummaryProps) {
    const hasPricing = lineItems.some((i) => i.price !== undefined);
    const hasTypes = lineItems.some((i) => i.type);
    const priceCols = hasPricing ? 1 : 0;
    const typeCols = hasTypes ? 1 : 0;

    return (
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                        Cart ({totalItemCount})
                    </span>
                </div>
                {startDate && endDate && (() => {
                    const days = calcDays(startDate, endDate);
                    return (
                        <span className="text-xs text-muted-foreground">
                            {formatDate(startDate)} – {formatDate(endDate)} · {days} day{days !== 1 ? 's' : ''}
                        </span>
                    );
                })()}
            </div>

            {/* Items table */}
            {lineItems.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            {hasTypes && <TableHead>Type</TableHead>}
                            <TableHead>Qty</TableHead>
                            {hasPricing && <TableHead className="text-right">Price</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {lineItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.label}</TableCell>
                                {hasTypes && <TableCell className="text-muted-foreground">{item.type ?? '—'}</TableCell>}
                                <TableCell className="text-muted-foreground">{item.qty}</TableCell>
                                {hasPricing && (
                                    <TableCell className="text-right tabular-nums">
                                        {item.price != null ? `RM ${item.price.toFixed(2)}` : '—'}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                    {hasPricing && totalPrice != null && (
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={2 + typeCols + priceCols - 1} className="font-medium">
                                    Estimated Total
                                </TableCell>
                                <TableCell className="text-right font-medium tabular-nums">
                                    RM {totalPrice.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            )}

            {/* Notes */}
            <div className="space-y-1">
                <Label htmlFor="cart-notes" className="text-xs">Notes</Label>
                <Textarea
                    id="cart-notes"
                    rows={3}
                    placeholder="Purpose / remarks..."
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    className="text-xs resize-none"
                />
            </div>

            {/* Error */}
            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{error.message}</AlertDescription>
                </Alert>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                {onCancel && (
                    <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
                        {cancelLabel}
                    </Button>
                )}
                <Button size="sm" onClick={onSubmit} disabled={isPending || isSubmitDisabled}>
                    {isPending && <Spinner className="mr-1" />}
                    {isPending ? 'Submitting…' : submitLabel}
                </Button>
            </div>
        </div>
    );
}
