import type { EquipmentDateStatus, EquipmentStatusType } from '@/store/schemas/equipment';
import { EQUIPMENT_STATUS_BADGE as STATUS_BADGE } from '@/constants/equipmentStatus';

export function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(d: string) {
    return new Date(d).toLocaleString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Map a status to calendar-event colours via the same badge tokens used elsewhere
// (badge-warning → var(--badge-warning-bg/fg)), so events match the badges and dark mode.
export function statusEventColors(type: EquipmentStatusType) {
    const variant = STATUS_BADGE[type].replace('badge-', '');
    return {
        backgroundColor: `var(--badge-${variant}-bg)`,
        textColor: `var(--badge-${variant}-fg)`,
        borderColor: 'transparent',
    };
}

export type SchedulableStatus = Exclude<
    EquipmentStatusType,
    'AVAILABLE' | 'BOOKED' | 'IN_USE' | 'PARTIALLY_AVAILABLE'
>;

export type StatusDialogMode =
    | { type: 'idle' }
    | { type: 'add'; start?: string; end?: string }
    | { type: 'manage'; entry: EquipmentDateStatus };
