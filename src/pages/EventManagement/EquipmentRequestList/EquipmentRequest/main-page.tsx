import { useState } from 'react';
import { ArrowLeft, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';


import { CartSummary, type CartLineItem } from '@/components/cart-summary';
import { EquipmentRequestConfirmationDialog } from '@/components/equipment-request-confirmation-dialog';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useSubmitRequest } from '@/store/queries/request';
import { SUB_EQUIPMENT_CONFIG } from '@/pages/InventoryManagement/provider';

import { useEquipmentRequestContext } from './context';
import { EquipmentRequestProvider } from './provider';
import {
    cameraColumns,
    lensColumns,
    requestBatteryColumns,
    requestSpeedlightColumns,
    requestSdCfCardColumns,
    requestTripodColumns,
    requestLainLainColumns,
} from './table-column-def';

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

    const cameras = mainEquipment.filter((e) => e.equipmentType === 'Camera');
    const lenses = mainEquipment.filter((e) => e.equipmentType === 'Lens');

    const batteryCameras = subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.batteryCameras.typeValue);
    const chargerBatteries = subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.chargerBatteries.typeValue);
    const speedlights = subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.speedlights.typeValue);
    const sdCfCards = subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.sdCfCards.typeValue);
    const tripods = subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.tripods.typeValue);
    const lainLain = subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.lainLain.typeValue);

    async function handleConfirm() {
        try {
            const subEquipmentEntries = Object.entries(subQty)
                .filter(([, qty]) => (qty as number) > 0)
                .map(([id, qty]) => ({ subEquipmentId: Number(id), quantity: qty as number }));

            await submitRequest.mutateAsync({
                eventId,
                equipmentIds: cartIds,
                ...(subEquipmentEntries.length > 0 ? { subEquipmentEntries } : {}),
                startDate,
                endDate,
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
        <div className="space-y-6 p-2 sm:p-6">
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

            {/* Cameras */}
            <DataTable
                columns={cameraColumns}
                data={cameras}
                isLoading={isEquipmentLoading}
                title="Cameras"
                totalElements={cameras.length}
                emptyMessage="No cameras available."
            />

            {/* Lenses */}
            <DataTable
                columns={lensColumns}
                data={lenses}
                isLoading={isEquipmentLoading}
                title="Lenses"
                totalElements={lenses.length}
                emptyMessage="No lenses available."
            />

            {/* Battery Camera */}
            {(isEquipmentLoading || batteryCameras.length > 0) && (
                <DataTable
                    columns={requestBatteryColumns}
                    data={batteryCameras}
                    isLoading={isEquipmentLoading}
                    title={SUB_EQUIPMENT_CONFIG.batteryCameras.label}
                    totalElements={batteryCameras.length}
                    emptyMessage="No battery cameras available."
                />
            )}

            {/* Charger Battery */}
            {(isEquipmentLoading || chargerBatteries.length > 0) && (
                <DataTable
                    columns={requestBatteryColumns}
                    data={chargerBatteries}
                    isLoading={isEquipmentLoading}
                    title={SUB_EQUIPMENT_CONFIG.chargerBatteries.label}
                    totalElements={chargerBatteries.length}
                    emptyMessage="No charger batteries available."
                />
            )}

            {/* Speedlight */}
            {(isEquipmentLoading || speedlights.length > 0) && (
                <DataTable
                    columns={requestSpeedlightColumns}
                    data={speedlights}
                    isLoading={isEquipmentLoading}
                    title={SUB_EQUIPMENT_CONFIG.speedlights.label}
                    totalElements={speedlights.length}
                    emptyMessage="No speedlights available."
                />
            )}

            {/* SD Card / CF Card */}
            {(isEquipmentLoading || sdCfCards.length > 0) && (
                <DataTable
                    columns={requestSdCfCardColumns}
                    data={sdCfCards}
                    isLoading={isEquipmentLoading}
                    title={SUB_EQUIPMENT_CONFIG.sdCfCards.label}
                    totalElements={sdCfCards.length}
                    emptyMessage="No SD/CF cards available."
                />
            )}

            {/* Tripod */}
            {(isEquipmentLoading || tripods.length > 0) && (
                <DataTable
                    columns={requestTripodColumns}
                    data={tripods}
                    isLoading={isEquipmentLoading}
                    title={SUB_EQUIPMENT_CONFIG.tripods.label}
                    totalElements={tripods.length}
                    emptyMessage="No tripods available."
                />
            )}

            {/* Others (Lain-Lain) */}
            {(isEquipmentLoading || lainLain.length > 0) && (
                <DataTable
                    columns={requestLainLainColumns}
                    data={lainLain}
                    isLoading={isEquipmentLoading}
                    title={SUB_EQUIPMENT_CONFIG.lainLain.label}
                    totalElements={lainLain.length}
                    emptyMessage="No other accessories available."
                />
            )}

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
