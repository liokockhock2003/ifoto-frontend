import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Rental } from '@/store/schemas/rental';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { RENTAL_STATUS_LABEL, type RentalStatus } from '@/constants/rentalStatus';
import { formatDate } from '@/lib/utils';
import { statusVariant } from '@/pages/MyRentalList/table-column-def';

import { BookingRowActions } from './table-row-actions';

const columnHelper = createColumnHelper<Rental>();

export const bookingManagementColumns: ColumnDef<Rental, any>[] = [
    columnHelper.accessor('rentalNumber', {
        header: 'Rental No.',
        cell: (info) => <span className="font-medium font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('renterUsername', {
        header: 'Renter',
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const { status, totalPenaltyAmount, paymentStatus } = info.row.original;
            const unpaidPenalty = status === 'RETURNED' && totalPenaltyAmount > 0 && paymentStatus !== 'PENALTY_PAID';
            return (
                <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={statusVariant(info.getValue())}>
                        {RENTAL_STATUS_LABEL[info.getValue() as RentalStatus] ?? info.getValue().replace(/_/g, ' ')}
                    </Badge>
                    {unpaidPenalty && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                </div>
            );
        },
    }),
    columnHelper.accessor('programStartDate', {
        header: 'Start Date',
        cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor('programEndDate', {
        header: 'End Date',
        cell: (info) => formatDate(info.getValue()),
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
        cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.display({
        id: 'actions',
        header: 'actions',
        cell: ({ row }) => <BookingRowActions row={row} />,
    }),
];
