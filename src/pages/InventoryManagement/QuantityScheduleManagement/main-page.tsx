import { ArrowLeft, PackageMinus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useEquipmentList } from '@/store/queries/equipment';

import { QuantityScheduleProvider } from './provider';
import { QuantityScheduleCalendar } from './schedule-calendar';
import { QuantityScheduleEntryDialog } from './dialog-entry';

export default function QuantityScheduleMainPage() {
    const { subEquipmentId } = useParams<{ subEquipmentId: string }>();
    const id = Number(subEquipmentId ?? 0);
    const navigate = useNavigate();

    const { data, isLoading } = useEquipmentList();
    const equipment = data?.subEquipment.find((e) => e.subEquipmentId === id);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-foreground">
                <p className="text-sm text-muted-foreground">Accessory not found.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/manage-inventory')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inventory
                </Button>
            </div>
        );
    }

    const displayName = equipment.equipmentType + (equipment.brand ? ` — ${equipment.brand}` : '');

    return (
        <QuantityScheduleProvider equipment={equipment}>
            <div className="space-y-6 p-2 sm:p-6 text-foreground">
                {/* Header */}
                <div className="flex items-center gap-3 text-foreground">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <PackageMinus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-primary">{displayName}</h1>
                        <p className="text-sm text-muted-foreground">
                            Schedule quantity holds for this accessory.
                        </p>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Tap/click an event to edit or delete · tap a day or drag a range to add · drag/resize to reschedule.
                </p>

                {/* Calendar — hover for details, click an entry to manage, drag to add. */}
                <QuantityScheduleCalendar />

                {/* Add / manage modal */}
                <QuantityScheduleEntryDialog />
            </div>
        </QuantityScheduleProvider>
    );
}
