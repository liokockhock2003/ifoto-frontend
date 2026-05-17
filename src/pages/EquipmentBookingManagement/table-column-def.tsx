import { Badge } from '@/components/ui/badge';
import type { Rental } from '@/store/schemas/rental';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
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
        cell: ({ row }) => <BookingRowActions row={row} />,
    }),
];
