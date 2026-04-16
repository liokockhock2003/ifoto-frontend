export const ROLE_LABELS: Record<string, string> = {
    ROLE_ADMIN: 'Admin',
    ROLE_STUDENT: 'Student',
    ROLE_EQUIPMENT_COMMITTEE: 'Equipment Committee',
    ROLE_EVENT_COMMITTEE: 'Event Committee',
    ROLE_GUEST: 'Guest',
    ROLE_HIGH_COMMITTEE: 'High Committee',
};

export const getRoleLabel = (role: string): string => ROLE_LABELS[role] ?? role;
