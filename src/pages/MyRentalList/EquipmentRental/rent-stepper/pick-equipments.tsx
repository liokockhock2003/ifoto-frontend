import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import { CartSummary, type CartLineItem } from '@/components/cart-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentRequestConfirmationDialog } from '@/components/equipment-request-confirmation-dialog';
import { AvailableEquipmentTables, MAIN_EQUIPMENT_FILTERS } from '@/components/available-equipment-tables';
import { useAuth } from '@/store/auth-context';
import { useAvailableEquipment } from '@/store/queries/equipment';
import { useRentalPricingList } from '@/store/queries/rental-pricing';
import { useCreateRental } from '@/store/queries/rental';
import type { RentalPricing } from '@/store/schemas/rental-pricing';

import { useEquipmentRentalContext } from '../context';
import { createAvailableEquipmentColumns, createAvailableSubEquipmentColumns } from '../table-column-def';
import { Separator } from '@/components/ui/separator';

function calcDays(start: string, end: string): number {
    const s = new Date(start).setHours(0, 0, 0, 0);
    const e = new Date(end).setHours(0, 0, 0, 0);
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

function calcItemPrice(pricing: RentalPricing, days: number): number {
    if (days <= 0) return 0;
    if (days === 1) return pricing.rate1Day;
    if (days === 2) return pricing.rate1Day * 2;
    if (days === 3) return pricing.rate3Days;
    return pricing.rate3Days + (days - 3) * pricing.ratePerDayExtra;
}

function RentalCartSummary({ onBack }: { onBack: () => void }) {
    const navigate = useNavigate();
    const { cartIds, subQty, notes, setNotes, startDate, endDate } = useEquipmentRentalContext();
    const { data: allEquipment } = useAvailableEquipment({
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        context: 'RENTAL',
    });
    const { mutate, isPending, error } = useCreateRental();
    const { data: pricingList } = useRentalPricingList();
    const { user } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);

    const memberType = (user?.roles ?? []).includes('ROLE_STUDENT') ? 'STUDENT' : 'NON_STUDENT';
    const days = startDate && endDate ? calcDays(startDate, endDate) : 0;

    const pricingMap = useMemo(() => {
        const map = new Map<number, RentalPricing>();
        (pricingList ?? [])
            .filter((p) => p.memberType === memberType)
            .forEach((p) => map.set(p.pricingCategoryId, p));
        return map;
    }, [pricingList, memberType]);

    function itemPrice(categoryId: number | null | undefined): number | null {
        if (!categoryId) return null;
        const p = pricingMap.get(categoryId);
        return p ? calcItemPrice(p, days) : null;
    }

    const cartItems = (allEquipment?.mainEquipment ?? []).filter((e) => cartIds.includes(e.mainEquipmentId));
    const mainLineItems: CartLineItem[] = cartItems.map((e) => ({
        id: `main-${e.mainEquipmentId}`,
        label: `${e.brand} ${e.model}`,
        type: e.equipmentType,
        qty: 1,
        price: itemPrice(e.pricingCategoryId),
    }));

    const subLineItems: CartLineItem[] = (allEquipment?.subEquipment ?? [])
        .filter((e) => (subQty[e.subEquipmentId] ?? 0) > 0)
        .map((e) => {
            const qty = subQty[e.subEquipmentId]!;
            const unitPrice = itemPrice(e.pricingCategoryId);
            return {
                id: `sub-${e.subEquipmentId}`,
                label: e.brand ? `${e.brand} ${e.equipmentType}` : e.equipmentType,
                type: e.equipmentType,
                qty,
                price: unitPrice !== null ? unitPrice * qty : null,
            };
        });

    const lineItems = [...mainLineItems, ...subLineItems];
    const totalItemCount = cartIds.length + subLineItems.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice =
        lineItems.length > 0 && lineItems.every((i) => i.price !== null)
            ? lineItems.reduce((sum, i) => sum + (i.price ?? 0), 0)
            : null;

    const subEquipmentEntries = Object.entries(subQty)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ subEquipmentId: Number(id), quantity: qty }));

    const handleConfirm = () => {
        if (!startDate || !endDate) return;
        mutate(
            {
                equipmentIds: cartIds,
                startDate,
                endDate,
                notes,
                subEquipmentEntries: subEquipmentEntries.length > 0 ? subEquipmentEntries : undefined,
            },
            { onSuccess: (data) => { navigate('/equipment-rent', { state: { rentalSubmitted: true, rentalNumber: data.rentalNumber } }); } },
        );
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-1/2">
                    <CartSummary
                        lineItems={lineItems}
                        totalItemCount={totalItemCount}
                        totalPrice={totalPrice}
                        startDate={startDate}
                        endDate={endDate}
                        notes={notes}
                        onNotesChange={setNotes}
                        onSubmit={() => setConfirmOpen(true)}
                        isPending={isPending}
                        error={error ?? null}
                        submitLabel="Review & Submit"
                        onCancel={onBack}
                        isSubmitDisabled={totalItemCount === 0}
                    />
                </div>
                <Card className="w-full sm:w-1/2 self-start border-warning/40 bg-warning/5">
                    <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-warning-foreground flex items-center gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                            Important Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 space-y-3">
                        <div className="flex gap-2 text-xs text-warning-foreground">
                            <span className="mt-0.5 shrink-0">•</span>
                            <span>
                                <span className="font-semibold">Partially available equipment: </span>Some items may have restricted availability windows due to overlapping bookings. If no fully available equipment exists, please review the availability time of partially available equipment carefully to ensure your intended pickup and return schedule does not conflict before proceeding.
                            </span>
                        </div>
                        <div className="flex gap-2 text-xs text-warning-foreground">
                            <span className="mt-0.5 shrink-0">•</span>
                            <span>
                                <span className="font-semibold">Camera & Lens compatibility: </span> Please ensure that your selected camera body and lens are fully compatible prior to submission. We strongly recommend verifying mount type and specifications beforehand. For technical guidance, contact Ipan at <span className="font-semibold">[Ipan's number]</span>.
                            </span>
                        </div>
                        <div className="flex gap-2 text-xs text-warning-foreground">
                            <span className="mt-0.5 shrink-0">•</span>
                            <span>
                                <span className="font-semibold">Program details: </span>If this rental is for a program or event, please provide program details in the notes field, including the program name, date, and venue where applicable.
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <EquipmentRequestConfirmationDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                onConfirm={handleConfirm}
                isPending={isPending}
                cartIds={cartIds}
                subQty={subQty}
                mainEquipment={allEquipment?.mainEquipment ?? []}
                subEquipment={allEquipment?.subEquipment ?? []}
                lineItems={lineItems}
                startDate={startDate ?? ''}
                endDate={endDate ?? ''}
                notes={notes}
                title="Submit Rental Request"
            />
        </>
    );
}

export function PickEquipments({
    onBack,
}: {
    onBack: () => void;
}) {
    const { startDate, endDate } = useEquipmentRentalContext();
    const { data, isLoading } = useAvailableEquipment({
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        context: 'RENTAL',
    });
    const { data: pricingList } = useRentalPricingList();
    const { user } = useAuth();

    const memberType = (user?.roles ?? []).includes('ROLE_STUDENT') ? 'STUDENT' : 'NON_STUDENT';
    const pricingMap = useMemo(() => {
        const map = new Map<number, RentalPricing>();
        (pricingList ?? [])
            .filter((p) => p.memberType === memberType)
            .forEach((p) => map.set(p.pricingCategoryId, p));
        return map;
    }, [pricingList, memberType]);

    const cameraColumns = useMemo(() => createAvailableEquipmentColumns(pricingMap), [pricingMap]);
    const lensColumns = useMemo(() => createAvailableEquipmentColumns(pricingMap, { showLensType: true }), [pricingMap]);
    const subEquipmentColumns = useMemo(() => createAvailableSubEquipmentColumns(pricingMap), [pricingMap]);

    return (
        <div className="space-y-6">
            <RentalCartSummary onBack={onBack} />
            <Separator className="bg-border-muted-foreground" />
            <AvailableEquipmentTables
                mainEquipment={data?.mainEquipment ?? []}
                subEquipment={data?.subEquipment ?? []}
                isLoading={isLoading}
                cameraColumns={cameraColumns}
                lensColumns={lensColumns}
                subColumns={subEquipmentColumns}
                mainFilters={MAIN_EQUIPMENT_FILTERS}
            />
        </div>
    );
}
