export const EQUIPMENT_CONDITIONS = ['GOOD', 'FAIR', 'FAULTY'] as const;
export type EquipmentCondition = typeof EQUIPMENT_CONDITIONS[number];

export const CONDITION_LABEL: Record<string, string> = {
    GOOD: 'Good',
    FAIR: 'Fair',
    FAULTY: 'Faulty',
};

export const EQUIPMENT_CONDITION_BADGE: Record<string, string> = {
    GOOD: 'badge-success',
    FAIR: 'badge-warning',
    FAULTY: 'badge-danger',
};
