export { REQUEST_STATUS_LABEL as STATUS_LABEL, REQUEST_STATUS_BADGE } from '@/constants/requestStatus';
export type { RequestStatus } from '@/store/schemas/request';

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

