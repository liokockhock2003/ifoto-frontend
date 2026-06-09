import { Clock, LoaderCircle, Printer } from 'lucide-react';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import { useInvoice, usePenaltyInvoice } from '@/store/queries/receipt';
import type { InvoiceDetail } from '@/store/schemas/receipt';

import { DocumentCard, invoiceToDoc } from './document-card';
import { InvoicePdfDocument } from './invoice.pdf';

// ── Per-tab card ──────────────────────────────────────────────────────────────

type InvoiceTabProps = {
    invoice: InvoiceDetail | null | undefined;
    isLoading: boolean;
    isError: boolean;
};

function InvoiceTab({ invoice, isLoading, isError }: InvoiceTabProps) {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading invoice…</span>
            </div>
        );
    }

    if (isError) {
        return (
            <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-xs">Failed to load invoice details.</AlertDescription>
            </Alert>
        );
    }

    if (!invoice) return null;

    return <DocumentCard data={invoiceToDoc(invoice)} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export function InvoiceView({ rentalId }: { rentalId: number | null }) {
    const { data: invoice, isLoading: invoiceLoading, isError } = useInvoice(rentalId);
    const { data: overdueInvoice, isLoading: overdueLoading, isError: isOverdueError } = usePenaltyInvoice(rentalId);
    const [activeTab, setActiveTab] = useState('invoice');

    const isLoading = invoiceLoading || overdueLoading;

    const handleDownload = async (doc: InvoiceDetail) => {
        const blob = await pdf(<InvoicePdfDocument invoice={doc} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${doc.invoiceNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleActiveDownload = () => {
        if (activeTab === 'invoice' && invoice) return handleDownload(invoice);
        if (activeTab === 'overdue' && overdueInvoice) return handleDownload(overdueInvoice);
        return Promise.resolve();
    };

    const hasOverdue = overdueInvoice !== null && overdueInvoice !== undefined;
    const hasInvoice = invoice !== null && invoice !== undefined;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading invoice…</span>
            </div>
        );
    }

    if (!hasInvoice && !hasOverdue && !isError) {
        return (
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Clock />
                    </EmptyMedia>
                    <EmptyTitle>Invoice not available yet</EmptyTitle>
                    <EmptyDescription>
                        Your invoice will be generated once the rental is approved by the Equipment Committee.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <Tabs className="flex flex-col items-center" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between w-full max-w-2xl px-8">
                <PrimaryTabsList>
                    <PrimaryTabsTrigger value="invoice">Invoice</PrimaryTabsTrigger>
                    {hasOverdue && (
                        <PrimaryTabsTrigger value="overdue">Overdue Invoice</PrimaryTabsTrigger>
                    )}
                </PrimaryTabsList>
                <Button size="sm" variant="outline" onClick={() => void handleActiveDownload()}>
                    <Printer className="h-4 w-4" />
                </Button>
            </div>

            <TabsContent value="invoice" className="pt-2">
                <InvoiceTab invoice={invoice} isLoading={false} isError={isError} />
            </TabsContent>

            {hasOverdue && (
                <TabsContent value="overdue" className="pt-2">
                    <InvoiceTab invoice={overdueInvoice} isLoading={false} isError={isOverdueError} />
                </TabsContent>
            )}
        </Tabs>
    );
}
