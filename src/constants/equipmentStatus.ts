import type { EquipmentStatusType } from '@/store/schemas/equipment';

export const EQUIPMENT_STATUS_OPTIONS: Exclude<EquipmentStatusType, 'AVAILABLE' | 'BOOKED'>[] = [
    'MAINTENANCE', 'UNAVAILABLE', 'CONVOCATION', 'MRM',
];

export const EQUIPMENT_STATUS_LABEL: Record<EquipmentStatusType, string> = {
    AVAILABLE:   'Available',
    BOOKED:      'Booked',
    MAINTENANCE: 'Maintenance',
    UNAVAILABLE: 'Unavailable',
    CONVOCATION: 'Convocation',
    MRM:         'MRM Event',
};

export const EQUIPMENT_STATUS_BADGE: Record<EquipmentStatusType, string> = {
    AVAILABLE:   'badge-success',
    BOOKED:      'badge-warning',
    MAINTENANCE: 'badge-warning',
    UNAVAILABLE: 'badge-danger',
    CONVOCATION: 'badge-info',
    MRM:         'badge-info',
};
