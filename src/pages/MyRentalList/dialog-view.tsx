import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { Rental, RentalItem } from '@/store/schemas/rental';
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
        <div className="rounded-md border overflow-hidden text-sm">
            <table className="w-full">
                <thead className="bg-muted/50">
                    <tr>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground">Equipment</th>
                        <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Type</th>
                        <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id} className="border-t">
                            <td className="px-3 py-2">
                                <p className="font-medium">{item.brand} {item.model}</p>
                                <p className="text-xs text-muted-foreground font-mono">{item.serialNumber}</p>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground hidden sm:table-cell">{item.equipmentType}</td>
                            <td className="px-3 py-2 text-right">
                                <p>{fmt(item.baseAmount)}</p>
                                {item.latePenaltyAmount > 0 && (
                                    <p className="text-xs text-destructive">+{fmt(item.latePenaltyAmount)} penalty</p>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto text-foreground">
                <DialogHeader>
                    <div className="flex items-center gap-3 flex-wrap">
                        <DialogTitle className="text-primary font-mono text-base">{rental.rentalNumber}</DialogTitle>
                        <Badge variant="outline" className={statusVariant(rental.status)}>
                            {rental.status.replace(/_/g, ' ')}
                        </Badge>
                    </div>
                </DialogHeader>

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
                </div>
            </DialogContent>
        </Dialog>
    );
}
