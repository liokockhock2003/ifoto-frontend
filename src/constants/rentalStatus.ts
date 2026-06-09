import type { RentalStatus } from '@/store/schemas/rental';

export type { RentalStatus };

export const RENTAL_STATUS_VALUES: RentalStatus[] = [
    'PENDING_REVIEW',
    'APPROVED',
    'PICKED_UP',
    'REJECTED',
    'CANCELLED',
    'PENDING_PAYMENT',
    'PAID',
    'ACTIVE',
    'OVERDUE',
    'RETURNED',
];

export const RENTAL_STATUS_LABEL: Record<RentalStatus, string> = {
    PENDING_REVIEW: 'Pending Review',
    APPROVED: 'Approved',
    PICKED_UP: 'Picked Up',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    PENDING_PAYMENT: 'Pending Payment',
    PAID: 'Paid',
    ACTIVE: 'Active',
    OVERDUE: 'Overdue',
    RETURNED: 'Returned',
};

export const RENTAL_STATUS_BADGE: Record<RentalStatus, string> = {
    PENDING_REVIEW: 'badge-warning',
    APPROVED: 'badge-success',
    PICKED_UP: 'badge-info',
    REJECTED: 'badge-danger',
    CANCELLED: 'badge-danger',
    PENDING_PAYMENT: 'badge-warning',
    PAID: 'badge-info',
    ACTIVE: 'badge-success',
    OVERDUE: 'badge-danger',
    RETURNED: 'badge-info',
};

// Chart colors for Recharts (ReportingDashboard)
export const RENTAL_STATUS_COLOR: Partial<Record<RentalStatus, string>> = {
    PENDING_REVIEW: 'var(--color-warning)',
    APPROVED:       'var(--color-primary)',
    ACTIVE:         '#22c55e',
    OVERDUE:        'var(--color-destructive)',
    RETURNED:       '#8b5cf6',
    REJECTED:       '#6b7280',
    CANCELLED:      '#94a3b8',
};
