import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { InvoiceDetail, ReceiptDetail, ReceiptPayment, ReceiptRental, ReceiptRenter } from '@/store/schemas/receipt';

const UTM_LOGO_PNG = '/utm-logo.png';
const KFK_LOGO_PNG = '/KFKLogo.svg';
const PAID_PNG = '/Paid-logo.png';

const CLUB_EMAIL = 'kelabfotokreatifutmjb@gmail.com';
const CLUB_ADDRESS_LINE1 = 'Universiti Teknologi Malaysia';
const CLUB_ADDRESS_LINE2 = 'Johor Bahru 81310';
const CLUB_ADDRESS_LINE3 = 'Johor, Malaysia';
const SIGNER_NAME = 'MUHAMMAD ALIF NABIL BIN JUNAIDI';
const SIGNER_POSITION = 'EXCO ALATAN KELAB FOTOKREATIF'

// ── Normalized document data ──────────────────────────────────────────────────

export type DocumentData = {
    docNumber: string;
    title: string;
    issuedAt: string;
    renter: ReceiptRenter;
    rental: ReceiptRental;
    payment: ReceiptPayment | null;
    isPenalty: boolean;
};

export function receiptToDoc(r: ReceiptDetail, isPenalty: boolean): DocumentData {
    return {
        docNumber: r.receiptNumber,
        title: 'RECEIPT',
        issuedAt: r.issuedAt,
        renter: r.renter,
        rental: r.rental,
        payment: r.payment,
        isPenalty,
    };
}

export function invoiceToDoc(i: InvoiceDetail): DocumentData {
    return {
        docNumber: i.invoiceNumber,
        title: 'INVOICE',
        issuedAt: i.issuedAt,
        renter: i.renter,
        rental: i.rental,
        payment: null,
        isPenalty: i.documentType === 'OVERDUE_INVOICE',
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function fmtRM(cents: number) {
    return `RM ${(cents / 100).toFixed(2)}`;
}

export function fmtDocDate(iso: string) {
    return new Date(iso)
        .toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
        .toUpperCase();
}

// ── Shared document card (HTML) ───────────────────────────────────────────────

export function DocumentCard({
    data,
    onDownload,
}: {
    data: DocumentData;
    onDownload?: () => Promise<void>;
}) {
    const hasPenalty = data.isPenalty;
    const isReceipt = data.payment !== null;
    const docAmount = hasPenalty ? data.rental.totalPenaltyAmount : data.rental.totalBaseAmount;

    return (
        <div className="space-y-4">
            {onDownload && (
                <div className="flex justify-end">
                    <Button size="sm" onClick={() => void onDownload()}>
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <div className="border rounded-lg bg-#F5F5EF px-16 pb-12 pt-4 space-y-6 shadow-sm print:shadow-none">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <img src={UTM_LOGO_PNG} alt="KFK Logo" className="h-40 w-40 object-contain" />
                    <img src={KFK_LOGO_PNG} alt="KFK Logo" className="h-30 w-30 object-contain" />
                </div>

                {/* Info block */}
                <div className="flex justify-between gap-4 text-sm">
                    <div className="space-y-0.5">
                        <p className="font-bold uppercase">ATTN: {data.renter.fullName}</p>
                        <p className="text-foreground text-s">{data.renter.email}</p>
                        <p className="text-foreground text-s">{data.renter.phoneNumber}</p>
                    </div>
                    <span className="text-4xl font-bold tracking-widest">{data.title}</span>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                    <div className="space-y-0.5">
                        <p className="text-foreground text-s">{CLUB_EMAIL}</p>
                        <p className="text-foreground text-s">{CLUB_ADDRESS_LINE1}</p>
                        <p className="text-foreground text-s">{CLUB_ADDRESS_LINE2}</p>
                        <p className="text-foreground text-s">{CLUB_ADDRESS_LINE3}</p>
                    </div>
                    <div className="space-y-0.5 text-right">

                        <p className="font-bold">{isReceipt ? 'RNo#' : 'INo#'}: {data.docNumber}</p>
                        <p className="text-foreground text-s">DATE: {fmtDocDate(data.issuedAt)}</p>
                    </div>
                </div>

                {/* <hr /> */}

                {/* Items table */}
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-t">
                            <th className="text-left py-2 w-8 font-semibold">No.</th>
                            <th className="text-left py-2 font-semibold">Item</th>
                            <th className="text-center py-2 w-10 font-semibold">Qty</th>
                            <th className="text-right py-2 w-24 font-semibold">Unit Price</th>
                            <th className="text-right py-2 w-24 font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rental.items.map((item, i) => (
                            <tr key={item.serialNumber} className="border-b last:border-b-0">
                                <td className="py-3 text-muted-foreground">{i + 1}.</td>
                                <td className="py-3">
                                    <span className="font-medium">{item.brand} {item.model}</span>
                                    <span className="text-xs text-muted-foreground ml-1.5">({item.equipmentType})</span>
                                </td>
                                <td className="py-3 text-center text-muted-foreground">1</td>
                                <td className="py-3 text-right font-mono text-xs">{fmtRM(hasPenalty ? item.penaltyAmount : item.baseAmount)}</td>
                                <td className="py-3 text-right font-mono text-xs">{fmtRM(hasPenalty ? item.penaltyAmount : item.baseAmount)}</td>
                            </tr>
                        ))}
                        {data.rental.subItems?.map((sub, i) => {
                            const qty = sub.borrowedQuantity;
                            const totalAmt = hasPenalty ? sub.penaltyAmount : sub.baseAmount;
                            const unitAmt = totalAmt / qty;
                            return (
                                <tr key={`${sub.type}-${i}`} className="border-b last:border-b-0">
                                    <td className="py-3 text-muted-foreground">{data.rental.items.length + i + 1}.</td>
                                    <td className="py-3">
                                        <span className="font-medium">{sub.brand ? `${sub.brand} ` : ''}{sub.equipmentType}</span>
                                        <span className="text-xs text-muted-foreground ml-1.5">(Accessory)</span>
                                    </td>
                                    <td className="py-3 text-center text-muted-foreground">{qty}</td>
                                    <td className="py-3 text-right font-mono text-xs">{fmtRM(unitAmt)}</td>
                                    <td className="py-3 text-right font-mono text-xs">{fmtRM(totalAmt)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex flex-col items-end gap-1 text-sm">
                    {isReceipt && (
                        <div className="flex justify-between w-52">
                            <span className="font-semibold">Payment</span>
                            <span className="font-mono text-xs text-red-600">-{fmtRM(docAmount)}</span>
                        </div>
                    )}
                    <hr className="w-52 my-1" />
                    <div className="flex justify-between w-52">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-lg font-mono">
                            {isReceipt ? 'RM 0.00' : fmtRM(docAmount)}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                {isReceipt ? (
                    <div className="flex items-end justify-between pt-4">
                        <div className="space-y-1">
                            <p className="font-semibold text-m">Received By :</p>
                            <div className="w-40 border-b border mt-24 mb-4" />
                            <p className="text-xs text-foreground">{SIGNER_NAME}</p>
                            <p className="text-xs text-foreground">({SIGNER_POSITION})</p>
                            <p className="text-2xl mt-4">Thank you!</p>
                        </div>
                        <img src={PAID_PNG} className="h-52 w-52 object-contain" alt="Paid" />
                    </div>
                ) : (
                    <div className="flex items-end justify-between pt-4">
                        <div className="space-y-1">
                            <p className="text-2xl mt-4">Thank you!</p>
                        </div>
                        <div className="space-y-1 justify-end items-end text-right">
                            <p className="text-2xl font-semibold mt-4">Accepted by</p>
                            <p className="text-m">{data.renter.fullName}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
