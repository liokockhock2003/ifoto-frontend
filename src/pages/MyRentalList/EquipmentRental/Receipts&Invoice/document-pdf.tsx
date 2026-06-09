import { Document, Page, View, Text, Image, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
    family: 'Playfair Display',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2', fontWeight: 'normal' },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2', fontWeight: 'bold' },
        { src: 'https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff2', fontStyle: 'italic' },
    ],
});

import type { DocumentData } from './document-card';
import { fmtRM, fmtDocDate } from './document-card';

const UTM_LOGO_PNG = '/utm-logo.png';
const KFK_LOGO_PNG = '/KFKLogo.png';
const PAID_PNG = '/Paid-logo.png';

const CLUB_EMAIL = 'kelabfotokreatifutmjb@gmail.com';
const CLUB_ADDRESS_LINE1 = 'Universiti Teknologi Malaysia';
const CLUB_ADDRESS_LINE2 = 'Johor Bahru 81310';
const CLUB_ADDRESS_LINE3 = 'Johor, Malaysia';
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
    docTitle: { fontSize: 34, fontFamily: 'Playfair Display', fontWeight: 'bold', letterSpacing: 3, color: '#111', textAlign: 'right' },

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
    sigBlock: { position: 'relative', width: 200, height: 100, marginTop: 8, marginBottom: 6 },
    sigLineAbsolute: { position: 'absolute', bottom: 0, left: 0, right: 0, borderBottomWidth: 1, borderBottomColor: '#111' },
    sigImageAbsolute: { position: 'absolute', width: 120, height: 60, bottom: 8, left: 0, objectFit: 'contain' },
    signerName: { fontSize: 12, color: '#111' },
    signerPosition: { fontSize: 11, color: '#555' },
    paidStamp: { width: 160, height: 160 },

    // Footer — invoice bank details
    bankDetailsBlock: { textAlign: 'right', alignItems: 'flex-end' },
    bankDetailsTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginBottom: 4 },
    bankDetailsRow: { fontSize: 11, color: '#444', textAlign: 'right', marginBottom: 2 },
    bankDetailsBold: { fontFamily: 'Helvetica-Bold', color: '#111' },
    noBankDetails: { fontSize: 10, color: '#888', fontStyle: 'italic', textAlign: 'right' },
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
                    <View key={item.serialNumber ?? i} style={s.tableRow}>
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
                            <View style={s.sigBlock}>
                                {data.committee?.type === 'receipt' && data.committee.signature && (
                                    <Image src={`data:image/png;base64,${data.committee.signature}`} style={s.sigImageAbsolute} />
                                )}
                                <View style={s.sigLineAbsolute} />
                            </View>
                            <Text style={s.signerName}>
                                {data.committee?.type === 'receipt' ? data.committee.approvedBy : '—'}
                            </Text>
                            <Text style={s.signerPosition}>({SIGNER_POSITION})</Text>
                            <Text style={s.thankYou}>Thank you!</Text>
                        </View>
                        <Image src={PAID_PNG} style={s.paidStamp} />
                    </View>
                ) : (
                    <View style={s.footer}>
                        <View>
                            <Text style={s.thankYou}>Thank you!</Text>
                            {data.committee?.type === 'invoice' ? (
                                <>
                                    <Text style={[s.bankDetailsTitle, { textAlign: 'left', marginTop: 12 }]}>Payment Information</Text>
                                    <Text style={[s.bankDetailsRow, { textAlign: 'left' }]}><Text style={s.bankDetailsBold}>{data.committee.bankName}</Text></Text>
                                    <Text style={[s.bankDetailsRow, { textAlign: 'left' }]}>Account Name: <Text style={s.bankDetailsBold}>{data.committee.accountName}</Text></Text>
                                    <Text style={[s.bankDetailsRow, { textAlign: 'left' }]}>Account No.: <Text style={s.bankDetailsBold}>{data.committee.accountNo}</Text></Text>
                                </>
                            ) : (
                                <Text style={[s.noBankDetails, { textAlign: 'left', marginTop: 8 }]}>Bank details not available. Contact committee.</Text>
                            )}
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 11, color: '#555', marginBottom: 6, fontFamily: 'Playfair Display', fontStyle: 'italic' }}>Accepted by</Text>
                            <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>{data.renter.fullName.toUpperCase()}</Text>
                        </View>
                    </View>
                )}

            </Page>
        </Document>
    );
}
