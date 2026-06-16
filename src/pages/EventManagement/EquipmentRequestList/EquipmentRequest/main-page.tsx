import { useState } from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


import { CartSummary, type CartLineItem } from '@/components/cart-summary';
import { EquipmentRequestConfirmationDialog } from '@/components/equipment-request-confirmation-dialog';
import { AvailableEquipmentTables, MAIN_EQUIPMENT_FILTERS } from '@/components/available-equipment-tables';
import { Button } from '@/components/ui/button';
import { useSubmitRequest } from '@/store/queries/request';

import { useEquipmentRequestContext } from './context';
import { EquipmentRequestProvider } from './provider';
import { createRequestEquipmentColumns, createRequestSubEquipmentColumns } from './table-column-def';

function RequestCartPanel({ onSubmit, isPending }: { onSubmit: () => void; isPending: boolean }) {
    const {
        mainEquipment,
        subEquipment,
        cartIds,
        subQty,
        startDate,
        endDate,
        notes,
        setNotes,
        clearCart,
    } = useEquipmentRequestContext();
    const navigate = useNavigate();

    const mainEquipmentMap = new Map(mainEquipment.map((e) => [e.mainEquipmentId, e]));
    const subEquipmentMap = new Map(subEquipment.map((e) => [e.subEquipmentId, e]));

    const mainLineItems: CartLineItem[] = cartIds.map((id) => {
        const eq = mainEquipmentMap.get(id);
        return {
            id: `main-${id}`,
            label: eq ? `${eq.brand} ${eq.model}` : `Equipment #${id}`,
            type: eq?.equipmentType,
            qty: 1,
        };
    });

    const subLineItems: CartLineItem[] = Object.entries(subQty)
        .filter(([, qty]) => (qty as number) > 0)
        .map(([idStr, qty]) => {
            const id = Number(idStr);
            const eq = subEquipmentMap.get(id);
            return {
                id: `sub-${id}`,
                label: eq ? (eq.brand ? `${eq.brand} ${eq.equipmentType}` : eq.equipmentType) : `Accessory #${id}`,
                type: eq?.equipmentType,
                qty: qty as number,
            };
        });

    const lineItems = [...mainLineItems, ...subLineItems];
    const totalItemCount = cartIds.length + subLineItems.reduce((sum, i) => sum + i.qty, 0);

    return (
        <CartSummary
            lineItems={lineItems}
            totalItemCount={totalItemCount}
            startDate={startDate}
            endDate={endDate}
            notes={notes}
            onNotesChange={setNotes}
            onSubmit={onSubmit}
            isPending={isPending}
            submitLabel="Review & Submit"
            onCancel={() => { clearCart(); navigate(-1); }}
            cancelLabel="Cancel"
            isSubmitDisabled={cartIds.length === 0 || !startDate || !endDate}
        />
    );
}

function EquipmentRequestContent() {
    const {
        mainEquipment,
        subEquipment,
        isEquipmentLoading,
        cartIds,
        subQty,
        startDate,
        endDate,
        notes,
        eventId,
        clearCart,
    } = useEquipmentRequestContext();

    const navigate = useNavigate();
    const submitRequest = useSubmitRequest();
    const [confirmOpen, setConfirmOpen] = useState(false);

    async function handleConfirm() {
        try {
            const subEquipmentEntries = Object.entries(subQty)
                .filter(([, qty]) => (qty as number) > 0)
                .map(([id, qty]) => ({ subEquipmentId: Number(id), quantity: qty as number }));

            await submitRequest.mutateAsync({
                eventId,
                equipmentIds: cartIds,
                ...(subEquipmentEntries.length > 0 ? { subEquipmentEntries } : {}),
                notes: notes || undefined,
            });
            clearCart();
            setConfirmOpen(false);
            navigate(-1);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to submit request');
        }
    }

    return (
        <div className="space-y-6 p-2 sm:p-6 text-foreground">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-primary">
                        New Equipment Request
                    </h1>
                    <p className="text-sm text-muted-foreground">Select equipment for your event</p>
                </div>
            </div>

            {/* Cart summary */}
            <RequestCartPanel onSubmit={() => setConfirmOpen(true)} isPending={submitRequest.isPending} />

            {/* Equipment picker — Camera/Lens tabs + sub-equipment tabs (grouped by brand) */}
            <AvailableEquipmentTables
                mainEquipment={mainEquipment}
                subEquipment={subEquipment}
                isLoading={isEquipmentLoading}
                cameraColumns={createRequestEquipmentColumns()}
                lensColumns={createRequestEquipmentColumns({ showLensType: true })}
                subColumns={createRequestSubEquipmentColumns()}
                mainFilters={MAIN_EQUIPMENT_FILTERS}
            />

            <EquipmentRequestConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onConfirm={() => void handleConfirm()}
                isPending={submitRequest.isPending}
                cartIds={cartIds}
                subQty={subQty}
                subEquipment={subEquipment}
                mainEquipment={mainEquipment}
                startDate={startDate}
                endDate={endDate}
                notes={notes}
            />
        </div>
    );
}

export default function EquipmentRequestMainPage() {
    return (
        <EquipmentRequestProvider>
            <EquipmentRequestContent />
        </EquipmentRequestProvider>
    );
}
