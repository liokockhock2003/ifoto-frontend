export const ROLE_LABELS: Record<string, string> = {
    ROLE_ADMIN: 'Admin',
    ROLE_STUDENT: 'Student',
    ROLE_EQUIPMENT_COMMITTEE: 'Equipment Committee',
    ROLE_EVENT_COMMITTEE: 'Event Committee',
    ROLE_NON_STUDENT: 'Non-student',
    ROLE_HIGH_COMMITTEE: 'High Committee',
};

export const getRoleLabel = (role: string): string => ROLE_LABELS[role] ?? role;

// Membership type (mutually exclusive) vs. committee/staff roles.
export const MEMBERSHIP_ROLES = ['ROLE_STUDENT', 'ROLE_NON_STUDENT'] as const;
export const COMMITTEE_ROLES = [
    'ROLE_ADMIN',
    'ROLE_HIGH_COMMITTEE',
    'ROLE_EQUIPMENT_COMMITTEE',
    'ROLE_EVENT_COMMITTEE',
] as const;

export const isMembershipRole = (role: string): boolean =>
    (MEMBERSHIP_ROLES as readonly string[]).includes(role);
export const isCommitteeRole = (role: string): boolean =>
    (COMMITTEE_ROLES as readonly string[]).includes(role);
