import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

import type { DocumentData } from './document-card';
import { fmtRM, fmtDocDate } from './document-card';

const UTM_LOGO_PNG = '/utm-logo.png';
const KFK_LOGO_PNG = '/KFKLogo.png';
const PAID_PNG = '/Paid-logo.png';

const CLUB_EMAIL = 'kelabfotokreatifutmjb@gmail.com';
const CLUB_ADDRESS_LINE1 = 'Universiti Teknologi Malaysia';
const CLUB_ADDRESS_LINE2 = 'Johor Bahru 81310';
const CLUB_ADDRESS_LINE3 = 'Johor, Malaysia';
const SIGNER_NAME = 'MUHAMMAD ALIF NABIL BIN JUNAIDI';
const SIGNER_POSITION = 'EXCO ALATAN KELAB FOTOKREATIF';

const s = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 12,
        paddingTop: 56,
        paddingHorizontal: 64,
        paddingBottom: 48,
        backgroundColor: '#F5F5EF',
        color: '#111',
    },

    // Header: logos side by side
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 20, marginBottom: 32 },
    utmLogo: { width: 120 },
    kfkLogo: { width: 80 },

    // Info row 1: ATTN block left, title right
    infoRow1: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    attnLeft: { flex: 1 },
    attn: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginBottom: 2 },
    infoText: { fontSize: 12, color: '#333', lineHeight: 1.3 },
    docTitle: { fontSize: 34, fontFamily: 'Helvetica-Bold', letterSpacing: 3, color: '#111', textAlign: 'right' },

    // Info row 2: club address left, doc number + date right
    infoRow2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
    clubLeft: { flex: 1 },
    docNumRight: { textAlign: 'right' },
    docNumLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11, textAlign: 'right', marginBottom: 2 },

    // Table — header has top + bottom border
    tableHeaderRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        marginBottom: 8,
    },
    tableHeaderCell: { fontFamily: 'Helvetica-Bold', fontSize: 12 },
    tableRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    tableCell: { fontSize: 12, color: '#333' },
    colNo: { width: 32 },
    colItem: { flex: 1 },
    colQty: { width: 44, textAlign: 'center' },
    colUnit: { width: 80, textAlign: 'right' },
    colTotal: { width: 80, textAlign: 'right' },

    // Totals
    totalsBlock: { marginTop: 28, alignItems: 'flex-end' },
    totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10, gap: 16 },
    totalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 12, width: 130, textAlign: 'right' },
    totalValue: { fontSize: 12, width: 90, textAlign: 'right' },
    totalValueRed: { fontSize: 12, width: 90, textAlign: 'right', color: '#c0392b' },
    totalDivider: { borderBottomWidth: 1, borderBottomColor: '#ccc', width: 160, marginBottom: 10, marginTop: 4 },
    grandTotalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 18, width: 130, textAlign: 'right' },
    grandTotalValue: { fontFamily: 'Helvetica-Bold', fontSize: 18, width: 90, textAlign: 'right' },

    // Footer — shared
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 50 },
    thankYou: { marginTop: 18, fontSize: 18, fontFamily: 'Helvetica', color: '#111' },

    // Footer — receipt
    receivedBy: { fontSize: 13, fontFamily: 'Helvetica-Bold' },
    sigLine: { borderBottomWidth: 1, borderBottomColor: '#111', width: 200, marginTop: 90, marginBottom: 6 },
    signerName: { fontSize: 12, color: '#111' },
    signerPosition: { fontSize: 11, color: '#555' },
    paidStamp: { width: 160, height: 160 },

    // Footer — invoice
    acceptedBy: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#111', textAlign: 'right' },
    acceptedName: { fontSize: 12, color: '#333', textAlign: 'right' },
});

export function DocumentPdfDocument({ data }: { data: DocumentData }) {
    const hasPenalty = data.isPenalty;
    const isReceipt = data.payment !== null;
    const docNumLabel = isReceipt ? 'RNo#' : 'INo#';
    const docAmount = hasPenalty ? data.rental.totalPenaltyAmount : data.rental.totalBaseAmount;

    return (
        <Document>
            <Page size="A4" style={s.page}>

                {/* Header: logos */}
                <View style={s.logoRow}>
                    <Image src={UTM_LOGO_PNG} style={s.utmLogo} />
                    <Image src={KFK_LOGO_PNG} style={s.kfkLogo} />
                </View>

                {/* Info row 1: ATTN + email + phone  |  title */}
                <View style={s.infoRow1}>
                    <View style={s.attnLeft}>
                        <Text style={s.attn}>ATTN: {data.renter.fullName.toUpperCase()}</Text>
                        <Text style={s.infoText}>{data.renter.email}</Text>
                        {data.renter.phoneNumber
                            ? <Text style={s.infoText}>{data.renter.phoneNumber}</Text>
                            : null
                        }
                    </View>
                    <Text style={s.docTitle}>{data.title}</Text>
                </View>

                {/* Info row 2: club address  |  doc number + date */}
                <View style={s.infoRow2}>
                    <View style={s.clubLeft}>
                        <Text style={s.infoText}>{CLUB_EMAIL}</Text>
                        <Text style={s.infoText}>{CLUB_ADDRESS_LINE1}</Text>
                        <Text style={s.infoText}>{CLUB_ADDRESS_LINE2}</Text>
                        <Text style={s.infoText}>{CLUB_ADDRESS_LINE3}</Text>
                    </View>
                    <View style={s.docNumRight}>
                        <Text style={s.docNumLabel}>{docNumLabel}: {data.docNumber}</Text>
                        <Text style={s.infoText}>DATE: {fmtDocDate(data.issuedAt)}</Text>
                    </View>
                </View>

                {/* Items table */}
                <View style={s.tableHeaderRow}>
                    <Text style={[s.tableHeaderCell, s.colNo]}>No.</Text>
                    <Text style={[s.tableHeaderCell, s.colItem]}>Item</Text>
                    <Text style={[s.tableHeaderCell, s.colQty]}>Qty</Text>
                    <Text style={[s.tableHeaderCell, s.colUnit]}>Unit Price</Text>
                    <Text style={[s.tableHeaderCell, s.colTotal]}>Total</Text>
                </View>
                {data.rental.items.map((item, i) => (
                    <View key={item.serialNumber} style={s.tableRow}>
                        <Text style={[s.tableCell, s.colNo]}>{i + 1}.</Text>
                        <Text style={[s.tableCell, s.colItem]}>{item.brand} {item.model} ({item.equipmentType})</Text>
                        <Text style={[s.tableCell, s.colQty]}>1</Text>
                        <Text style={[s.tableCell, s.colUnit]}>{fmtRM(hasPenalty ? item.penaltyAmount : item.baseAmount)}</Text>
                        <Text style={[s.tableCell, s.colTotal]}>{fmtRM(hasPenalty ? item.penaltyAmount : item.baseAmount)}</Text>
                    </View>
                ))}
                {data.rental.subItems?.map((sub, i) => {
                    const qty = sub.borrowedQuantity;
                    const totalAmt = hasPenalty ? sub.penaltyAmount : sub.baseAmount;
                    const unitAmt = totalAmt / qty;
                    return (
                        <View key={`${sub.type}-${i}`} style={s.tableRow}>
                            <Text style={[s.tableCell, s.colNo]}>{data.rental.items.length + i + 1}.</Text>
                            <Text style={[s.tableCell, s.colItem]}>{sub.brand ? `${sub.brand} ` : ''}{sub.equipmentType} (Accessory)</Text>
                            <Text style={[s.tableCell, s.colQty]}>{qty}</Text>
                            <Text style={[s.tableCell, s.colUnit]}>{fmtRM(unitAmt)}</Text>
                            <Text style={[s.tableCell, s.colTotal]}>{fmtRM(totalAmt)}</Text>
                        </View>
                    );
                })}

                {/* Totals */}
                <View style={s.totalsBlock}>
                    {isReceipt && (
                        <View style={s.totalRow}>
                            <Text style={s.totalLabel}>Payment</Text>
                            <Text style={s.totalValueRed}>-{fmtRM(docAmount)}</Text>
                        </View>
                    )}
                    <View style={s.totalDivider} />
                    <View style={s.totalRow}>
                        <Text style={s.grandTotalLabel}>Total</Text>
                        <Text style={s.grandTotalValue}>
                            {isReceipt ? 'RM 0.00' : fmtRM(docAmount)}
                        </Text>
                    </View>
                </View>

                {/* Footer */}
                {isReceipt ? (
                    <View style={s.footer}>
                        <View>
                            <Text style={s.receivedBy}>Received By :</Text>
                            <View style={s.sigLine} />
                            <Text style={s.signerName}>{SIGNER_NAME}</Text>
                            <Text style={s.signerPosition}>({SIGNER_POSITION})</Text>
                            <Text style={s.thankYou}>Thank you!</Text>
                        </View>
                        <Image src={PAID_PNG} style={s.paidStamp} />
                    </View>
                ) : (
                    <View style={s.footer}>
                        <View>
                            <Text style={s.thankYou}>Thank you!</Text>
                        </View>
                        <View>
                            <Text style={s.acceptedBy}>Accepted by</Text>
                            <Text style={s.acceptedName}>{data.renter.fullName}</Text>
                        </View>
                    </View>
                )}

            </Page>
        </Document>
    );
}
