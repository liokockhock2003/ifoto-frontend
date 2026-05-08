import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import type { ReceiptDetail } from '@/store/schemas/receipt';

// ── Image assets (replace paths when PNGs are provided) ──────────────────────
const LOGO_PNG = '/placeholder-logo.png';
const PAID_PNG = '/placeholder-paid.png';

const CLUB_ADDRESS_LINE1 = 'Universiti Teknologi Malaysia';
const CLUB_ADDRESS_LINE2 = 'Johor Bahru 81310, Johor, Malaysia';
const SIGNER_NAME = 'EXCO ALATAN KELAB FOTOKREATIF';

function fmtRM(cents: number) {
    return `RM ${(cents / 100).toFixed(2)}`;
}

function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

const s = StyleSheet.create({
    page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#111' },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    logo: { width: 80, height: 80 },
    receiptTitle: { fontSize: 36, fontFamily: 'Helvetica-Bold', letterSpacing: 4, color: '#111', marginTop: 8 },

    // Info block
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    infoLeft: { flex: 1 },
    infoRight: { textAlign: 'right' },
    attn: { fontFamily: 'Helvetica-Bold', fontSize: 10, marginBottom: 2 },
    infoText: { fontSize: 9, color: '#444', lineHeight: 1.5 },
    rnoLabel: { fontFamily: 'Helvetica-Bold', fontSize: 10 },

    divider: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 12 },

    // Table
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: 6, marginBottom: 4 },
    tableHeaderCell: { fontFamily: 'Helvetica-Bold', fontSize: 9 },
    tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tableCell: { fontSize: 9, color: '#333' },
    colNo: { width: 28 },
    colItem: { flex: 1 },
    colQty: { width: 36, textAlign: 'center' },
    colUnit: { width: 64, textAlign: 'right' },
    colTotal: { width: 64, textAlign: 'right' },

    // Totals
    totalsBlock: { marginTop: 12, alignItems: 'flex-end' },
    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4, gap: 16 },
    totalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 9, width: 100, textAlign: 'right' },
    totalValue: { fontSize: 9, width: 72, textAlign: 'right' },
    totalValueRed: { fontSize: 9, width: 72, textAlign: 'right', color: '#c0392b' },
    totalDivider: { borderBottomWidth: 1, borderBottomColor: '#ccc', width: 172, marginBottom: 6, marginTop: 2 },
    grandTotalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 12, width: 100, textAlign: 'right' },
    grandTotalValue: { fontFamily: 'Helvetica-Bold', fontSize: 12, width: 72, textAlign: 'right' },

    // Footer
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 },
    receivedBy: { fontSize: 9 },
    sigLine: { borderBottomWidth: 1, borderBottomColor: '#111', width: 140, marginTop: 28, marginBottom: 4 },
    signerName: { fontSize: 8, color: '#555' },
    paidStamp: { width: 88, height: 88 },

    thankYou: { marginTop: 20, fontSize: 14, fontFamily: 'Helvetica-Bold', color: '#111' },
});

export function ReceiptPdfDocument({ receipt }: { receipt: ReceiptDetail }) {
    const hasPenalty = receipt.rental.totalPenaltyAmount > 0;

    return (
        <Document>
            <Page size="A4" style={s.page}>

                {/* Header */}
                <View style={s.header}>
                    <Image src={LOGO_PNG} style={s.logo} />
                    <Text style={s.receiptTitle}>RECEIPT</Text>
                </View>

                {/* Info block */}
                <View style={s.infoRow}>
                    <View style={s.infoLeft}>
                        <Text style={s.attn}>ATTN: {receipt.renter.fullName.toUpperCase()}</Text>
                        <Text style={s.infoText}>{receipt.renter.email}</Text>
                        <Text style={s.infoText}>{CLUB_ADDRESS_LINE1}</Text>
                        <Text style={s.infoText}>{CLUB_ADDRESS_LINE2}</Text>
                    </View>
                    <View style={s.infoRight}>
                        <Text style={s.rnoLabel}>RNo#: {receipt.receiptNumber}</Text>
                        <Text style={s.infoText}>DATE: {fmtDate(receipt.issuedAt)}</Text>
                    </View>
                </View>

                <View style={s.divider} />

                {/* Items table */}
                <View style={s.tableHeader}>
                    <Text style={[s.tableHeaderCell, s.colNo]}>No.</Text>
                    <Text style={[s.tableHeaderCell, s.colItem]}>Item</Text>
                    <Text style={[s.tableHeaderCell, s.colQty]}>Qty</Text>
                    <Text style={[s.tableHeaderCell, s.colUnit]}>Unit Price</Text>
                    <Text style={[s.tableHeaderCell, s.colTotal]}>Total</Text>
                </View>
                {receipt.rental.items.map((item, i) => (
                    <View key={item.serialNumber} style={s.tableRow}>
                        <Text style={[s.tableCell, s.colNo]}>{i + 1}.</Text>
                        <Text style={[s.tableCell, s.colItem]}>{item.brand} {item.model} ({item.equipmentType})</Text>
                        <Text style={[s.tableCell, s.colQty]}>1</Text>
                        <Text style={[s.tableCell, s.colUnit]}>{fmtRM(item.rateApplied)}</Text>
                        <Text style={[s.tableCell, s.colTotal]}>{fmtRM(item.itemTotal)}</Text>
                    </View>
                ))}

                {/* Totals */}
                <View style={s.totalsBlock}>
                    <View style={s.totalRow}>
                        <Text style={s.totalLabel}>Subtotal</Text>
                        <Text style={s.totalValue}>{fmtRM(receipt.rental.totalBaseAmount)}</Text>
                    </View>
                    {hasPenalty && (
                        <View style={s.totalRow}>
                            <Text style={s.totalLabel}>Late Penalty</Text>
                            <Text style={s.totalValueRed}>{fmtRM(receipt.rental.totalPenaltyAmount)}</Text>
                        </View>
                    )}
                    <View style={s.totalRow}>
                        <Text style={s.totalLabel}>Payment</Text>
                        <Text style={s.totalValueRed}>-{fmtRM(receipt.rental.totalAmount)}</Text>
                    </View>
                    <View style={s.totalDivider} />
                    <View style={s.totalRow}>
                        <Text style={s.grandTotalLabel}>Total</Text>
                        <Text style={s.grandTotalValue}>RM 0.00</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={s.footer}>
                    <View>
                        <Text style={s.receivedBy}>Received By :</Text>
                        <View style={s.sigLine} />
                        <Text style={s.signerName}>{SIGNER_NAME}</Text>
                        <Text style={[s.thankYou, { marginTop: 16 }]}>Thank you!</Text>
                    </View>
                    <Image src={PAID_PNG} style={s.paidStamp} />
                </View>

            </Page>
        </Document>
    );
}
