import { Badge } from '@/components/ui/badge';
import type { Rental } from '@/store/schemas/rental';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { RentalRowActions } from './table-row-actions';

const columnHelper = createColumnHelper<Rental>();

const statusBadgeClass: Record<string, string> = {
    PENDING_REVIEW:   'badge-warning',
    APPROVED:         'badge-success',
    REJECTED:         'badge-danger',
    CANCELLED:        'badge-danger',
    PENDING_PAYMENT:  'badge-warning',
    PENDING_CASH:     'badge-warning',
    PAID:             'badge-info',
    ACTIVE:           'badge-success',
    OVERDUE:          'badge-danger',
    RETURNED:         'badge-info',
};

export function statusVariant(status: string): string {
    return statusBadgeClass[status] ?? '';
}

export const rentalListColumns: ColumnDef<Rental, any>[] = [
    columnHelper.accessor('rentalNumber', {
        header: 'Rental No.',
        cell: (info) => <span className="font-medium font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => (
            <Badge variant="outline" className={statusVariant(info.getValue())}>
                {info.getValue().replace(/_/g, ' ')}
            </Badge>
        ),
    }),
    columnHelper.accessor('requestedStartDate', {
        header: 'Start Date',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('requestedEndDate', {
        header: 'End Date',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('totalBaseAmount', {
        header: 'Base Amount',
        cell: (info) => `RM ${(info.getValue() / 100).toFixed(2)}`,
    }),
    columnHelper.accessor('totalPenaltyAmount', {
        header: 'Penalty',
        cell: (info) => info.getValue() === 0
            ? <span className="text-muted-foreground">—</span>
            : <span className="text-destructive font-medium">RM {(info.getValue() / 100).toFixed(2)}</span>,
    }),
    columnHelper.accessor('createdAt', {
        header: 'Submitted',
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => <RentalRowActions row={row} />,
    }),
];
