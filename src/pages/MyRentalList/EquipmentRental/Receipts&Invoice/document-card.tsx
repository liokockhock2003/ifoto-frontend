import type { CSSProperties } from 'react';
import { Printer } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { HorizontalScroller, ScrollChevron } from '@/components/horizontal-scroller';
import type { InvoiceDetail, ReceiptDetail, ReceiptPayment, ReceiptRental, ReceiptRenter } from '@/store/schemas/receipt';

// The document is a printed "paper" — always light. Pin the theme tokens to their
// light-mode values so text/borders stay dark on the cream background in dark mode.
const PAPER_LIGHT_TOKENS = {
    '--foreground': 'oklch(14.479% 0.00002 271.152)',
    '--muted-foreground': 'oklch(54.517% 0.00006 271.152)',
    '--border': 'oklch(0.9355 0.0324 80.9937)',
} as CSSProperties;

const UTM_LOGO_PNG = '/utm-logo.png';
const KFK_LOGO_PNG = '/KFKLogo.svg';
const PAID_PNG = '/Paid-logo.png';

const CLUB_EMAIL = 'kelabfotokreatifutmjb@gmail.com';
const CLUB_ADDRESS_LINE1 = 'Universiti Teknologi Malaysia';
const CLUB_ADDRESS_LINE2 = 'Johor Bahru 81310';
const CLUB_ADDRESS_LINE3 = 'Johor, Malaysia';
const SIGNER_POSITION = 'EXCO ALATAN KELAB FOTOKREATIF';

// ── Normalized document data ──────────────────────────────────────────────────

type CommitteeDoc =
    | { type: 'invoice'; bankName: string; accountNo: string; accountName: string; signature: string | null }
    | { type: 'receipt'; approvedBy: string; signature: string | null };

export type DocumentData = {
    docNumber: string;
    title: string;
    issuedAt: string;
    renter: ReceiptRenter;
    rental: ReceiptRental;
    payment: ReceiptPayment | null;
    isPenalty: boolean;
    committee: CommitteeDoc | null;
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
        committee: r.committee
            ? { type: 'receipt', approvedBy: r.committee.approvedBy, signature: r.committee.signature }
            : null,
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
        committee: i.committee
            ? { type: 'invoice', bankName: i.committee.bankName, accountNo: i.committee.accountNo, accountName: i.committee.accountName, signature: i.committee.signature }
            : null,
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
    const subTotal = docAmount;
    const paid = isReceipt ? docAmount : 0;
    const total = subTotal - paid;

    return (
        <div className="space-y-4">
            {onDownload && (
                <div className="flex justify-end">
                    <Button size="sm" onClick={() => void onDownload()}>
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Print-accurate document keeps its designed width and scrolls horizontally on
                narrow screens instead of squeezing (which made it overflow its parent vertically).
                Chevron indicators show when there's more to scroll. */}
            <HorizontalScroller
                className="max-w-full"
                leftIndicator={<ScrollChevron side="left" className="from-[#F5F5EF]/80 text-zinc-700" />}
                rightIndicator={<ScrollChevron side="right" className="from-[#F5F5EF]/80 text-zinc-700" />}
            >
                <div
                    style={PAPER_LIGHT_TOKENS}
                    className="min-w-3xl border rounded-lg bg-[#F5F5EF] text-foreground px-16 pb-12 pt-4 space-y-6 shadow-sm print:shadow-none"
                >

                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <img src={UTM_LOGO_PNG} alt="KFK Logo" className="h-40 w-40 object-contain" />
                        <img src={KFK_LOGO_PNG} alt="KFK Logo" className="h-30 w-30 object-contain" />
                    </div>

                    {/* Info block */}
                    <div className="flex justify-between gap-4 text-sm">
                        <div className="space-y-0.5">
                            <p className="font-bold uppercase">ATTN: {data.renter.fullName}</p>
                            <p className="font-bold uppercase">{data.renter.position}</p>
                            <p className="text-foreground text-s">{data.renter.phoneNumber}</p>
                        </div>
                        <span className="text-4xl font-bold tracking-wide font-[Playfair_Display]">{data.title}</span>
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
                                <tr key={item.serialNumber ?? i} className="border-b last:border-b-0">
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
                        <div className="flex justify-between w-52">
                            <span className="font-semibold">Subtotal</span>
                            <span className="font-mono text-xs">{fmtRM(subTotal)}</span>
                        </div>
                        <div className="flex justify-between w-52">
                            <span className="font-semibold">Payment</span>
                            <span className="font-mono text-xs text-red-600">{`-${fmtRM(paid)}`}</span>
                        </div>
                        <hr className="w-52 my-1" />
                        <div className="flex justify-between w-52">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-lg font-mono">{fmtRM(total)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    {isReceipt ? (
                        <div className="flex items-end justify-between pt-4">
                            <div className="space-y-1">
                                <p className="font-semibold text-m">Received By :</p>
                                {data.committee?.type === 'receipt' && data.committee.signature ? (
                                    <img
                                        src={`data:image/png;base64,${data.committee.signature}`}
                                        alt="Signature"
                                        className="h-16 object-contain"
                                    />
                                ) : (
                                    <div className="w-40 border-b border mt-24 mb-4" />
                                )}
                                <p className="text-xs text-foreground">
                                    {data.committee?.type === 'receipt' ? data.committee.approvedBy : '—'}
                                </p>
                                <p className="text-xs text-foreground">({SIGNER_POSITION})</p>
                                <p className="text-2xl mt-4">Thank you!</p>
                            </div>
                            <img src={PAID_PNG} className="h-52 w-52 object-contain" alt="Paid" />
                        </div>
                    ) : (
                        <div className="flex items-end justify-between pt-4">
                            <div className="space-y-1 text-sm">
                                <p className="text-2xl mb-3">Thank you!</p>
                                {data.committee?.type === 'invoice' ? (
                                    <>
                                        <p className="font-semibold text-base">Payment Information</p>
                                        <p className="text-foreground">{data.committee.bankName}</p>
                                        <p className="text-foreground">Account Name: <span className="text-foreground">{data.committee.accountName}</span></p>
                                        <p className="text-foreground">Account No.: <span className="text-foreground">{data.committee.accountNo}</span></p>
                                    </>
                                ) : (
                                    <p className="text-muted-foreground text-xs italic">Bank details not available. Contact committee.</p>
                                )}
                            </div>
                            <div className="text-right text-sm">
                                <p className="text-foreground text-xl mb-1.5 font-[Playfair_Display]">Accepted by</p>
                                <p className="uppercase">{data.renter.fullName}</p>
                            </div>
                        </div>
                    )}
                </div>
            </HorizontalScroller>
        </div>
    );
}
