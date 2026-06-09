import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useEquipmentList } from '@/store/queries/equipment';

import { StatusScheduleProvider } from './provider';
import { StatusScheduleCalendar } from './schedule-calendar';
import { StatusScheduleEntryDialog } from './dialog-entry';

export default function StatusScheduleMainPage() {
    const { mainEquipmentId } = useParams<{ mainEquipmentId: string }>();
    const id = Number(mainEquipmentId ?? 0);
    const navigate = useNavigate();

    const { data, isLoading } = useEquipmentList();
    const equipment = data?.mainEquipment.find((e) => e.mainEquipmentId === id);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8">
                <p className="text-sm text-muted-foreground">Equipment not found.</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/manage-inventory')}>
                    <ArrowLeft className="h-4 w-4" />
                    Back to Inventory
                </Button>
            </div>
        );
    }

    return (
        <StatusScheduleProvider equipment={equipment}>
            <div className="space-y-6 p-2 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-primary">
                            {equipment.brand} {equipment.model}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Add maintenance / availability windows for this equipment.
                        </p>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground">
                    Click an event to edit or delete · drag a range to add · drag/resize to reschedule.
                </p>

                {/* Calendar — hover for details, click an entry to manage, drag to add. */}
                <StatusScheduleCalendar />

                {/* Add / manage modal */}
                <StatusScheduleEntryDialog />
            </div>
        </StatusScheduleProvider>
    );
}
