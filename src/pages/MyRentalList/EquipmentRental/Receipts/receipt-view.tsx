import { Download, LoaderCircle } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useMyReceipts, useReceiptDetail } from '@/store/queries/receipt';

import { ReceiptPdfDocument } from './receipt-pdf';

// ── Image assets (replace paths when PNGs are provided) ──────────────────────
const LOGO_PNG = '/placeholder-logo.png';
const PAID_PNG = '/placeholder-paid.png';

const CLUB_ADDRESS_LINE1 = 'Universiti Teknologi Malaysia';
const CLUB_ADDRESS_LINE2 = 'Johor Bahru 81310';
const CLUB_ADDRESS_LINE3 = 'Johor, Malaysia';
const SIGNER_NAME = 'EXCO ALATAN KELAB FOTOKREATIF';

function fmtRM(cents: number) {
    return `RM ${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
    return new Date(iso)
        .toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase();
}

// ── Main component ────────────────────────────────────────────────────────────

export function ReceiptView({ rentalNumber, isGenerating }: { rentalNumber: string; isGenerating?: boolean }) {
    const { data: receiptList, isLoading: listLoading } = useMyReceipts(
        { refetchInterval: isGenerating ? 2000 : false }
    );

    const receiptSummary = receiptList?.find((r) => r.rentalNumber === rentalNumber);
    const receiptNumber = receiptSummary?.receiptNumber ?? '';

    const { data: receipt, isLoading: detailLoading, isError } = useReceiptDetail(receiptNumber);

    const isLoading = listLoading || detailLoading;

    const handleDownload = async () => {
        if (!receipt) return;
        const blob = await pdf(<ReceiptPdfDocument receipt={receipt} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${receipt.receiptNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading receipt…</span>
            </div>
        );
    }

    if (isGenerating && !receiptSummary) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Spinner className="size-6" />
                <p className="text-sm font-medium">Generating your receipt…</p>
                <p className="text-xs">This may take a moment. Please wait.</p>
            </div>
        );
    }

    if (isError || !receipt) {
        return (
            <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-xs">
                    {!receiptSummary
                        ? 'No receipt found for this rental.'
                        : 'Failed to load receipt details.'}
                </AlertDescription>
            </Alert>
        );
    }

    const hasPenalty = receipt.rental.totalPenaltyAmount > 0;

    return (
        <div className="space-y-4">
            {/* Download button */}
            <div className="flex justify-end">
                <Button size="sm" variant="outline" className="gap-2" onClick={() => void handleDownload()}>
                    <Download className="h-4 w-4" />
                    Download PDF
                </Button>
            </div>

            {/* Receipt card */}
            <div className="border rounded-lg bg-white text-black p-8 space-y-6 max-w-2xl mx-auto shadow-sm print:shadow-none">

                {/* Header */}
                <div className="flex items-start justify-between">
                    <img src={LOGO_PNG} alt="KFK Logo" className="h-20 w-20 object-contain" />
                    <span className="text-4xl font-bold tracking-widest">RECEIPT</span>
                </div>

                {/* Info block */}
                <div className="flex justify-between gap-4 text-sm">
                    <div className="space-y-0.5">
                        <p className="font-bold uppercase">ATTN: {receipt.renter.fullName}</p>
                        <p className="text-muted-foreground text-xs">{receipt.renter.email}</p>
                        <p className="text-muted-foreground text-xs">{CLUB_ADDRESS_LINE1}</p>
                        <p className="text-muted-foreground text-xs">{CLUB_ADDRESS_LINE2}</p>
                        <p className="text-muted-foreground text-xs">{CLUB_ADDRESS_LINE3}</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="font-bold text-sm">RNo#: {receipt.receiptNumber}</p>
                        <p className="text-xs text-muted-foreground">DATE: {fmtDate(receipt.issuedAt)}</p>
                    </div>
                </div>

                <hr />

                {/* Items table */}
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-2 w-8 font-semibold">No.</th>
                            <th className="text-left py-2 font-semibold">Item</th>
                            <th className="text-center py-2 w-10 font-semibold">Qty</th>
                            <th className="text-right py-2 w-24 font-semibold">Unit Price</th>
                            <th className="text-right py-2 w-24 font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipt.rental.items.map((item, i) => (
                            <tr key={item.serialNumber} className="border-b last:border-b-0">
                                <td className="py-3 text-muted-foreground">{i + 1}.</td>
                                <td className="py-3">
                                    <span className="font-medium">{item.brand} {item.model}</span>
                                    <span className="text-xs text-muted-foreground ml-1.5">({item.equipmentType})</span>
                                </td>
                                <td className="py-3 text-center text-muted-foreground">1</td>
                                <td className="py-3 text-right font-mono text-xs">{fmtRM(item.rateApplied)}</td>
                                <td className="py-3 text-right font-mono text-xs">{fmtRM(item.itemTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex flex-col items-end gap-1 text-sm">
                    <div className="flex justify-between w-52">
                        <span className="font-semibold">Subtotal</span>
                        <span className="font-mono text-xs">{fmtRM(receipt.rental.totalBaseAmount)}</span>
                    </div>
                    {hasPenalty && (
                        <div className="flex justify-between w-52">
                            <span className="font-semibold">Late Penalty</span>
                            <span className="font-mono text-xs text-red-600">{fmtRM(receipt.rental.totalPenaltyAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between w-52">
                        <span className="font-semibold">Payment</span>
                        <span className="font-mono text-xs text-red-600">-{fmtRM(receipt.rental.totalAmount)}</span>
                    </div>
                    <hr className="w-52 my-1" />
                    <div className="flex justify-between w-52">
                        <span className="font-bold text-base">Total</span>
                        <span className="font-bold text-base font-mono">RM 0.00</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between pt-4">
                    <div className="space-y-1">
                        <p className="font-semibold text-sm">Received By :</p>
                        <div className="w-40 border-b border-black mt-8 mb-1" />
                        <p className="text-xs text-muted-foreground">{SIGNER_NAME}</p>
                        <p className="text-xl font-bold mt-4">Thank you!</p>
                    </div>
                    <img src={PAID_PNG} className="h-22 w-22 object-contain" alt="Paid" />
                </div>

            </div>
        </div>
    );
}
