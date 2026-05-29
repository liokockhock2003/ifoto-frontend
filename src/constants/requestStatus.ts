import type { RequestStatus } from '@/store/schemas/request';
export type { RequestStatus };

export const REQUEST_STATUS_VALUES: RequestStatus[] = [
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'ACTIVE',
    'RETURNED',
];

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
    PENDING_REVIEW: 'Pending Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
    ACTIVE: 'Active',
    RETURNED: 'Returned',
};

export const REQUEST_STATUS_BADGE: Record<RequestStatus, string> = {
    PENDING_REVIEW: 'badge-warning',
    APPROVED: 'badge-success',
    REJECTED: 'badge-danger',
    CANCELLED: 'badge-danger',
    ACTIVE: 'badge-success',
    RETURNED: '',
};
