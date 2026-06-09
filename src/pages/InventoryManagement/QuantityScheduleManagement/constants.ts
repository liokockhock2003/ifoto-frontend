import type { SubEquipmentQuantityHold } from '@/store/schemas/equipment';

export function fmtDate(d: string) {
    return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(d: string) {
    return new Date(d).toLocaleString('en-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Quantity holds render in amber via the shared badge tokens (theme-aware).
export const HOLD_EVENT_COLORS = {
    backgroundColor: 'var(--badge-warning-bg)',
    textColor: 'var(--badge-warning-fg)',
    borderColor: 'transparent',
} as const;

export type HoldDialogMode =
    | { type: 'idle' }
    | { type: 'add'; start?: string; end?: string }
    | { type: 'manage'; entry: SubEquipmentQuantityHold };
