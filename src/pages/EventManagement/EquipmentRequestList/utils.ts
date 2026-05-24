import type { RequestStatus } from '@/store/schemas/request';

export function formatDate(iso: string | null | undefined) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDateRange(start: string | null | undefined, end: string | null | undefined) {
    if (!start || !end) return '—';
    const s = new Date(start);
    const e = new Date(end);
    const sameYear = s.getFullYear() === e.getFullYear();
    return `${s.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: sameYear ? undefined : 'numeric' })} ${e.getFullYear()}`;
}

export const STATUS_VARIANT: Record<RequestStatus, { variant: 'outline' | 'secondary'; className: string }> = {
    PENDING_REVIEW: { variant: 'outline', className: 'badge-warning' },
    APPROVED:       { variant: 'outline', className: 'badge-success' },
    ACTIVE:         { variant: 'outline', className: 'badge-success' },
    REJECTED:       { variant: 'outline', className: 'badge-danger' },
    CANCELLED:      { variant: 'outline', className: 'badge-danger' },
    RETURNED:       { variant: 'outline', className: '' },
};

export const STATUS_LABEL: Record<RequestStatus, string> = {
    PENDING_REVIEW: 'Pending Review',
    APPROVED:       'Approved',
    ACTIVE:         'Active',
    REJECTED:       'Rejected',
    CANCELLED:      'Cancelled',
    RETURNED:       'Returned',
};
