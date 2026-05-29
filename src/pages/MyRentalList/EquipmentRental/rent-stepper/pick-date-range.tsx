import { CalendarDays } from 'lucide-react';

import { RangeDatePicker } from '@/components/range-date-picker';
import { Button } from '@/components/ui/button';

import { useEquipmentRentalContext } from '../context';

export function PickDateRange({ onNext }: { onNext: () => void }) {
    const { startDate, endDate, setStartDate, setEndDate } = useEquipmentRentalContext();
    const canAdvance = !!startDate && !!endDate;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
                <CalendarDays className="h-5 w-5" />
                <h2 className="font-semibold">Select your rental period</h2>
            </div>
            <div className="auto-cols-max grid w-full gap-4">
                <RangeDatePicker
                    startDate={startDate}
                    endDate={endDate}
                    onStartChange={setStartDate}
                    onEndChange={setEndDate}
                    placeholder="Pick rental period"
                />
            </div>
            <Button onClick={onNext} disabled={!canAdvance} size="sm">
                Next
            </Button>
        </div>
    );
}
