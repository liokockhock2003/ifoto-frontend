import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Rental, RentalItem, RentalSubItem } from '@/store/schemas/rental';
import { RENTAL_STATUS_LABEL, type RentalStatus } from '@/constants/rentalStatus';
import { statusVariant } from './table-column-def';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(cents: number) {
    return `RM ${(cents / 100).toFixed(2)}`;
}

function fmtDate(date: string | null) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground shrink-0">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-1">
            {children}
        </p>
    );
}

function ItemsTable({ items }: { items: RentalItem[] }) {
    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <p className="font-medium">{item.brand} {item.model}</p>
                                <p className="text-xs text-muted-foreground font-mono">{item.serialNumber}</p>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden sm:table-cell">{item.equipmentType}</TableCell>
                            <TableCell className="text-right">
                                <p>{fmt(item.baseAmount)}</p>
                                {item.latePenaltyAmount > 0 && (
                                    <p className="text-xs text-destructive">+{fmt(item.latePenaltyAmount)} penalty</p>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function SubItemsTable({ items }: { items: RentalSubItem[] }) {
    return (
        <div className="rounded-md border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Accessory</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Qty</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell>
                                <p className="font-medium">{item.brand ? `${item.brand} ` : ''}{item.equipmentType}</p>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                                {item.borrowedQuantity}
                            </TableCell>
                            <TableCell className="text-right">
                                {item.itemTotalAmount != null ? (
                                    <>
                                        <p>{fmt(item.itemTotalAmount)}</p>
                                        {(item.latePenaltyAmount ?? 0) > 0 && (
                                            <p className="text-xs text-destructive">+{fmt(item.latePenaltyAmount!)} penalty</p>
                                        )}
                                    </>
                                ) : '—'}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ── RentalViewDialog ──────────────────────────────────────────────────────────

type RentalViewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function RentalViewDialog({ open, onOpenChange, rental }: RentalViewDialogProps) {
    if (!rental) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg text-foreground">
                <DialogHeader>
                    <div className="flex items-center gap-3 flex-wrap">
                        <DialogTitle className="text-primary font-mono text-base">{rental.rentalNumber}</DialogTitle>
                        <Badge variant="outline" className={statusVariant(rental.status)}>
                            {RENTAL_STATUS_LABEL[rental.status as RentalStatus] ?? rental.status.replace(/_/g, ' ')}
                        </Badge>
                    </div>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-4">
                        {/* Overview */}
                        <div className="space-y-2">
                            <SectionHeading>Overview</SectionHeading>
                            <InfoRow label="Submitted" value={new Date(rental.createdAt).toLocaleString('en-MY')} />
                            <InfoRow label="Renter" value={rental.renterUsername} />
                            <InfoRow label="Payment Method" value={rental.paymentMethod} />
                            <InfoRow label="Payment Status" value={rental.paymentStatus} />
                        </div>

                        <Separator />

                        {/* Dates */}
                        <div className="space-y-2">
                            <SectionHeading>Dates</SectionHeading>
                            <InfoRow label="Requested Start" value={fmtDate(rental.requestedStartDate)} />
                            <InfoRow label="Requested End" value={fmtDate(rental.requestedEndDate)} />
                            <InfoRow label="Approved Start" value={fmtDate(rental.approvedStartDate)} />
                            <InfoRow label="Approved End" value={fmtDate(rental.approvedEndDate)} />
                            {rental.durationDays !== null && (
                                <InfoRow label="Duration" value={`${rental.durationDays} day${rental.durationDays !== 1 ? 's' : ''}`} />
                            )}
                        </div>

                        <Separator />

                        {/* Financials */}
                        <div className="space-y-2">
                            <SectionHeading>Financials</SectionHeading>
                            <InfoRow label="Base Amount" value={fmt(rental.totalBaseAmount)} />
                            <InfoRow label="Penalty" value={fmt(rental.totalPenaltyAmount)} />
                            <InfoRow
                                label="Total"
                                value={<span className="text-primary font-semibold">{fmt(rental.totalAmount)}</span>}
                            />
                        </div>

                        <Separator />

                        {/* Notes */}
                        {(rental.renterNotes || rental.committeeNotes || rental.rejectionReason) && (
                            <>
                                <div className="space-y-2">
                                    <SectionHeading>Notes</SectionHeading>
                                    {rental.renterNotes && (
                                        <InfoRow label="Your Notes" value={rental.renterNotes} />
                                    )}
                                    {rental.committeeNotes && (
                                        <InfoRow label="Committee Notes" value={rental.committeeNotes} />
                                    )}
                                    {rental.rejectionReason && (
                                        <InfoRow
                                            label="Rejection Reason"
                                            value={<span className="text-destructive">{rental.rejectionReason}</span>}
                                        />
                                    )}
                                </div>
                                <Separator />
                            </>
                        )}

                        {/* Items */}
                        <div className="space-y-2">
                            <SectionHeading>Equipment ({rental.items.length})</SectionHeading>
                            <ItemsTable items={rental.items} />
                        </div>

                        {/* Sub-items */}
                        {(rental.subItems ?? []).length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <SectionHeading>Accessories ({(rental.subItems ?? []).length})</SectionHeading>
                                    <SubItemsTable items={rental.subItems!} />
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
