import { useState } from 'react';
import { ArrowLeft, CalendarDays, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useSubmitRequest } from '@/store/queries/request';

import { useEquipmentRequestContext } from './context';
import { EquipmentRequestConfirmationDialog } from './dialog-confirmation';
import { EquipmentRequestProvider } from './provider';
import { cameraColumns, lensColumns, subEquipmentColumns } from './table-column-def';

function fmtDate(date: string) {
    return new Date(date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EquipmentRequestContent() {
    const {
        mainEquipment,
        subEquipment,
        isEquipmentLoading,
        cartIds,
        startDate,
        endDate,
        notes,
        eventId,
        setNotes,
        clearCart,
    } = useEquipmentRequestContext();

    const navigate = useNavigate();
    const submitRequest = useSubmitRequest();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const canSubmit = cartIds.length > 0 && !!startDate && !!endDate;

    async function handleConfirm() {
        try {
            await submitRequest.mutateAsync({
                eventId,
                equipmentIds: cartIds,
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
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <ClipboardList className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-primary">
                        New Equipment Request
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Select equipment for your event
                    </p>
                </div>
            </div>

            {/* Event period (read-only) */}
            {startDate && endDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground rounded-md border px-4 py-2.5 max-w-lg">
                    <CalendarDays className="h-4 w-4 shrink-0" />
                    <span>
                        Event period:{' '}
                        <span className="font-medium text-foreground">{fmtDate(startDate)}</span>
                        {' – '}
                        <span className="font-medium text-foreground">{fmtDate(endDate)}</span>
                    </span>
                </div>
            )}

            {/* Cameras */}
            <DataTable
                columns={cameraColumns}
                data={mainEquipment.filter((e) => e.equipmentType === 'Camera')}
                isLoading={isEquipmentLoading}
                title="Cameras"
                totalElements={mainEquipment.filter((e) => e.equipmentType === 'Camera').length}
                emptyMessage="No cameras available."
            />

            {/* Lenses */}
            <DataTable
                columns={lensColumns}
                data={mainEquipment.filter((e) => e.equipmentType === 'Lens')}
                isLoading={isEquipmentLoading}
                title="Lenses"
                totalElements={mainEquipment.filter((e) => e.equipmentType === 'Lens').length}
                emptyMessage="No lenses available."
            />

            {/* Accessories */}
            {(isEquipmentLoading || subEquipment.length > 0) && (
                <DataTable
                    columns={subEquipmentColumns}
                    data={subEquipment}
                    isLoading={isEquipmentLoading}
                    title="Accessories"
                    totalElements={subEquipment.length}
                    emptyMessage="No accessories available."
                />
            )}

            {/* Cart summary + notes + submit */}
            <div className="space-y-4 max-w-lg rounded-md border p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Selected items</span>
                    <span className="font-semibold">{cartIds.length}</span>
                </div>

                <Field>
                    <FieldLabel>Notes (optional)</FieldLabel>
                    <Input
                        placeholder="Add any notes for the equipment committee..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </Field>

                <Button
                    type="button"
                    className="w-full"
                    disabled={!canSubmit}
                    onClick={() => setConfirmOpen(true)}
                >
                    Submit Request
                </Button>
            </div>

            <EquipmentRequestConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onConfirm={() => void handleConfirm()}
                isPending={submitRequest.isPending}
                cartCount={cartIds.length}
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
