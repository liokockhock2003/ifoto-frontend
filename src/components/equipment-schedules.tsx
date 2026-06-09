import { CalendarClock, NotepadText, PackageMinus, Wrench } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { ScheduleEntry } from '@/components/full-calendar';
import {
    EQUIPMENT_STATUS_BADGE,
    EQUIPMENT_STATUS_LABEL,
} from '@/constants/equipmentStatus';
import type {
    EquipmentSchedulesResponse,
    EquipmentStatusType,
    ScheduledMainEquipment,
    ScheduledSubEquipment,
    EquipmentScheduleStatus,
    EquipmentScheduleHold,
} from '@/store/schemas/equipment';

function fmtDateTime(iso: string) {
    return new Date(iso).toLocaleString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// The schedules endpoint may return status types beyond the management enum
// (e.g. RESERVED); map known ones, fall back to a neutral badge + raw label.
function statusBadgeClass(statusType: string): string {
    return EQUIPMENT_STATUS_BADGE[statusType as EquipmentStatusType] ?? 'badge-info';
}
function statusLabel(statusType: string): string {
    return EQUIPMENT_STATUS_LABEL[statusType as EquipmentStatusType] ?? statusType.replace(/_/g, ' ');
}

// Calendar-event colours via the shared badge tokens (theme-aware), with a fallback
// for unknown status types so we never index an undefined badge class.
function statusColors(statusType: string) {
    const variant = statusBadgeClass(statusType).replace('badge-', '');
    return {
        backgroundColor: `var(--badge-${variant}-bg)`,
        textColor: `var(--badge-${variant}-fg)`,
        borderColor: 'transparent',
    };
}
const HOLD_COLORS = {
    backgroundColor: 'var(--badge-warning-bg)',
    textColor: 'var(--badge-warning-fg)',
    borderColor: 'transparent',
} as const;

function equipmentLabel(m: ScheduledMainEquipment) {
    return `${m.brand} ${m.model}${m.serialNumber ? ` · ${m.serialNumber}` : ''}`;
}
function accessoryLabel(s: ScheduledSubEquipment) {
    return s.brand ? `${s.brand} ${s.type}` : s.type;
}

// Plain render helpers (not components) so this util module exports only buildScheduleOverlay.
function renderWindow(start: string, end: string) {
    return (
        <div className="flex items-start gap-1.5 text-muted-foreground">
            <CalendarClock className="h-3 w-3 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
                <p><span className="text-foreground/70">From</span> {fmtDateTime(start)}</p>
                <p><span className="text-foreground/70">To</span> {fmtDateTime(end)}</p>
            </div>
        </div>
    );
}

function renderNotes(notes: string | null) {
    if (!notes) return null;
    return (
        <div className="flex items-start gap-1.5 rounded-md bg-muted/50 px-2.5 py-2">
            <NotepadText className="h-3 w-3 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-foreground whitespace-pre-wrap">{notes}</p>
        </div>
    );
}

function renderStatusDetail(label: string, status: EquipmentScheduleStatus) {
    return (
        <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Wrench className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{label}</span>
                </span>
                <Badge variant="outline" className={statusBadgeClass(status.statusType)}>
                    {statusLabel(status.statusType)}
                </Badge>
            </div>
            {renderWindow(status.startDatetime, status.endDatetime)}
            {renderNotes(status.notes)}
        </div>
    );
}

function renderHoldDetail(label: string, hold: EquipmentScheduleHold) {
    return (
        <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <PackageMinus className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{label}</span>
                </span>
                <Badge variant="outline" className="badge-warning">
                    {hold.quantity} unit{hold.quantity !== 1 ? 's' : ''}
                </Badge>
            </div>
            {renderWindow(hold.startDatetime, hold.endDatetime)}
            {renderNotes(hold.notes)}
        </div>
    );
}

/**
 * Flatten an equipment-schedules response into read-only calendar overlay events:
 * one per main-equipment status window and one per sub-equipment quantity hold.
 * Ids are string-namespaced so they never collide with interactive entries.
 */
export function buildScheduleOverlay(data: EquipmentSchedulesResponse | undefined): ScheduleEntry[] {
    if (!data) return [];
    const overlay: ScheduleEntry[] = [];

    for (const m of data.mainEquipment) {
        const label = equipmentLabel(m);
        for (const s of m.statuses) {
            overlay.push({
                id: `status-${s.id}`,
                title: `${statusLabel(s.statusType)} · ${m.brand} ${m.model}`,
                start: s.startDatetime,
                end: s.endDatetime,
                detail: renderStatusDetail(label, s),
                ...statusColors(s.statusType),
            });
        }
    }

    for (const s of data.subEquipment) {
        const label = accessoryLabel(s);
        for (const h of s.holds) {
            overlay.push({
                id: `hold-${h.id}`,
                title: `${s.type} · ${h.quantity} held`,
                start: h.startDatetime,
                end: h.endDatetime,
                detail: renderHoldDetail(label, h),
                ...HOLD_COLORS,
            });
        }
    }

    return overlay;
}
