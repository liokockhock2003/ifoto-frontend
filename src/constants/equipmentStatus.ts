import type { EquipmentStatusType } from '@/store/schemas/equipment';

export const EQUIPMENT_STATUS_OPTIONS: Exclude<EquipmentStatusType, 'AVAILABLE' | 'BOOKED' | 'IN_USE'>[] = [
    'MAINTENANCE', 'UNAVAILABLE', 'CONVOCATION', 'MRM',
];

export const EQUIPMENT_STATUS_LABEL: Record<EquipmentStatusType, string> = {
    AVAILABLE:   'Available',
    BOOKED:      'Booked',
    IN_USE:      'In Use',
    MAINTENANCE: 'Maintenance',
    UNAVAILABLE: 'Unavailable',
    CONVOCATION: 'Convocation',
    MRM:         'MRM Event',
};

export const EQUIPMENT_STATUS_BADGE: Record<EquipmentStatusType, string> = {
    AVAILABLE:   'badge-success',
    BOOKED:      'badge-warning',
    IN_USE:      'badge-warning',
    MAINTENANCE: 'badge-warning',
    UNAVAILABLE: 'badge-danger',
    CONVOCATION: 'badge-info',
    MRM:         'badge-info',
};
