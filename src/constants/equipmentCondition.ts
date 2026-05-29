export const EQUIPMENT_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'] as const;
export type EquipmentCondition = typeof EQUIPMENT_CONDITIONS[number];

export const EQUIPMENT_CONDITION_BADGE: Record<string, string> = {
    Excellent: 'badge-success',
    Good:      'badge-info',
    Fair:      'badge-warning',
    Poor:      'badge-danger',
};
