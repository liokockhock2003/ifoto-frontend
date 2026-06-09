import { CalendarClock, NotepadText, PackageMinus } from 'lucide-react';

import { ScheduleCalendar } from '@/components/full-calendar';
import { Badge } from '@/components/ui/badge';
import type { SubEquipmentQuantityHold } from '@/store/schemas/equipment';

import { useQuantityScheduleContext } from './context';
import { fmtDateTime, HOLD_EVENT_COLORS } from './constants';

function HoldEntryDetails({ entry }: { entry: SubEquipmentQuantityHold }) {
    return (
        <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <PackageMinus className="h-3.5 w-3.5 text-primary" />
                    Quantity Hold
                </span>
                <Badge variant="outline" className="badge-warning">
                    {entry.quantity} unit{entry.quantity !== 1 ? 's' : ''}
                </Badge>
            </div>

            <div className="flex items-start gap-1.5 text-muted-foreground">
                <CalendarClock className="h-3 w-3 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                    <p><span className="text-foreground/70">From</span> {fmtDateTime(entry.startDatetime)}</p>
                    <p><span className="text-foreground/70">To</span> {fmtDateTime(entry.endDatetime)}</p>
                </div>
            </div>

            {entry.notes && (
                <div className="flex items-start gap-1.5 rounded-md bg-muted/50 px-2.5 py-2">
                    <NotepadText className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
                    <p className="text-foreground whitespace-pre-wrap">{entry.notes}</p>
                </div>
            )}
        </div>
    );
}

export function QuantityScheduleCalendar() {
    const { holds, rentals, requests, openAdd, openManage, rescheduleEntry } = useQuantityScheduleContext();

    return (
        <ScheduleCalendar
            entries={holds.map((h) => ({
                id: h.id,
                title: `${h.quantity} unit${h.quantity !== 1 ? 's' : ''}`,
                start: h.startDatetime,
                end: h.endDatetime,
                detail: <HoldEntryDetails entry={h} />,
                ...HOLD_EVENT_COLORS,
            }))}
            rentals={rentals}
            requests={requests}
            onSelectRange={(start, end) => openAdd(start, end)}
            onEntryClick={(id) => {
                const entry = holds.find((h) => h.id === id);
                if (entry) openManage(entry);
            }}
            onEntryDatesChange={(id, start, end) => void rescheduleEntry(id, start, end)}
        />
    );
}
