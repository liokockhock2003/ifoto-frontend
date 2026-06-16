import { LoaderCircle, Printer } from 'lucide-react';
import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import { useReceipt, usePenaltyReceipt } from '@/store/queries/receipt';
import type { ReceiptDetail } from '@/store/schemas/receipt';

import { DocumentCard, receiptToDoc } from './document-card';
import { ReceiptPdfDocument } from './receipt-pdf';

// ── Loading / error wrappers ──────────────────────────────────────────────────

function LoadingCard() {
    return (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading receipt…</span>
        </div>
    );
}

function GeneratingCard() {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
            <Spinner className="size-6" />
            <p className="text-sm font-medium">Generating your receipt…</p>
            <p className="text-xs">This may take a moment. Please wait.</p>
        </div>
    );
}

function ErrorCard() {
    return (
        <Alert variant="destructive" className="py-2">
            <AlertDescription className="text-xs">Failed to load receipt details.</AlertDescription>
        </Alert>
    );
}

// ── Per-tab card ──────────────────────────────────────────────────────────────

type ReceiptTabProps = {
    receipt: ReceiptDetail | null | undefined;
    isPenalty: boolean;
    isLoading: boolean;
    isError: boolean;
    isSSEConnected?: boolean;
};

function ReceiptTab({ receipt, isPenalty, isLoading, isError, isSSEConnected }: ReceiptTabProps) {
    if (isLoading) return <LoadingCard />;
    if (isSSEConnected && !receipt) return <GeneratingCard />;
    if (isError || !receipt) return <ErrorCard />;
    return <DocumentCard data={receiptToDoc(receipt, isPenalty)} />;
}

// ── Main component ────────────────────────────────────────────────────────────

export function ReceiptView({ rentalId, isSSEConnected }: { rentalId: number | null; isSSEConnected?: boolean }) {
    const { data: receipt, isLoading: receiptLoading, isError } = useReceipt(rentalId);
    const { data: penaltyReceipt, isLoading: penaltyLoading, isError: isPenaltyError } = usePenaltyReceipt(rentalId);
    const [activeTab, setActiveTab] = useState('receipt');

    const isLoading = receiptLoading || penaltyLoading;

    const handleDownload = async (doc: ReceiptDetail, isPenalty: boolean) => {
        const blob = await pdf(<ReceiptPdfDocument receipt={doc} isPenalty={isPenalty} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${doc.receiptNumber}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleActiveDownload = () => {
        if (activeTab === 'receipt' && receipt) return handleDownload(receipt, false);
        if (activeTab === 'penalty' && penaltyReceipt) return handleDownload(penaltyReceipt, true);
        return Promise.resolve();
    };

    const hasPenalty = penaltyReceipt !== null && penaltyReceipt !== undefined;

    return (
        <Tabs className="flex flex-col items-center" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between w-full max-w-3xl px-8">
                <PrimaryTabsList>
                    <PrimaryTabsTrigger value="receipt">Receipt</PrimaryTabsTrigger>
                    {hasPenalty && (
                        <PrimaryTabsTrigger value="penalty">Penalty Receipt</PrimaryTabsTrigger>
                    )}
                </PrimaryTabsList>
                <Button size="sm" variant="outline" onClick={() => void handleActiveDownload()}>
                    <Printer className="h-4 w-4" />
                </Button>
            </div>

            <TabsContent value="receipt" className="pt-2 w-full max-w-3xl">
                <ReceiptTab
                    receipt={receipt}
                    isPenalty={false}
                    isLoading={isLoading}
                    isError={isError}
                    isSSEConnected={isSSEConnected}
                />
            </TabsContent>

            {hasPenalty && (
                <TabsContent value="penalty" className="pt-2 w-full max-w-3xl">
                    <ReceiptTab
                        receipt={penaltyReceipt}
                        isPenalty={true}
                        isLoading={isLoading}
                        isError={isPenaltyError}
                    />
                </TabsContent>
            )}
        </Tabs>
    );
}
