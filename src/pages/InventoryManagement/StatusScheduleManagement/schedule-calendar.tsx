import { CalendarClock, NotepadText, Wrench } from 'lucide-react';

import { ScheduleCalendar } from '@/components/full-calendar';
import { Badge } from '@/components/ui/badge';
import {
    EQUIPMENT_STATUS_LABEL as STATUS_LABEL,
    EQUIPMENT_STATUS_BADGE as STATUS_BADGE,
} from '@/constants/equipmentStatus';
import type { EquipmentDateStatus } from '@/store/schemas/equipment';

import { useStatusScheduleContext } from './context';
import { fmtDateTime, statusEventColors } from './constants';

function StatusEntryDetails({ entry }: { entry: EquipmentDateStatus }) {
    return (
        <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Wrench className="h-3.5 w-3.5 text-primary" />
                    Status
                </span>
                <Badge variant="outline" className={STATUS_BADGE[entry.statusType]}>
                    {STATUS_LABEL[entry.statusType]}
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

export function StatusScheduleCalendar() {
    const { statuses, rentals, requests, openAdd, openManage, rescheduleEntry } = useStatusScheduleContext();

    return (
        <ScheduleCalendar
            entries={statuses.map((s) => ({
                id: s.id,
                title: STATUS_LABEL[s.statusType],
                start: s.startDatetime,
                end: s.endDatetime,
                detail: <StatusEntryDetails entry={s} />,
                ...statusEventColors(s.statusType),
            }))}
            rentals={rentals}
            requests={requests}
            onSelectRange={(start, end) => openAdd(start, end)}
            onEntryClick={(id) => {
                const entry = statuses.find((s) => s.id === id);
                if (entry) openManage(entry);
            }}
            onEntryDatesChange={(id, start, end) => void rescheduleEntry(id, start, end)}
        />
    );
}
