import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MinusCircle, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BookedDate, RentableEquipment } from '@/store/schemas/equipment';

import { useEquipmentRentalContext } from './context';

const conditionBadgeClass: Record<string, string> = {
    Excellent: 'badge-success',
    Good: 'badge-info',
    Fair: 'badge-warning',
    Poor: 'badge-danger',
};

const statusBadgeClass: Record<string, string> = {
    Available: 'badge-success',
    'In Use': 'badge-info',
    Maintenance: 'badge-warning',
    Unavailable: 'badge-danger',
};

function CartActionCell({ equipmentId, bookedDates }: { equipmentId: number; bookedDates: BookedDate[] }) {
    const { isInCart, addToCart, removeFromCart, startDate, endDate } = useEquipmentRentalContext();

    const datesSelected = !!startDate && !!endDate;

    const isBooked =
        datesSelected &&
        bookedDates.some((b) => !b.pending && b.startDate <= endDate && b.endDate >= startDate);

    const inCart = isInCart(equipmentId);

    if (!datesSelected) {
        return (
            <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                Select dates
            </Button>
        );
    }

    if (isBooked) {
        return <Badge variant="outline" className="badge-danger">Booked</Badge>;
    }

    return inCart ? (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => removeFromCart(equipmentId)}
        >
            <MinusCircle className="h-4 w-4" />
            Remove
        </Button>
    ) : (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-primary border-primary hover:bg-primary/10"
            onClick={() => addToCart(equipmentId)}
        >
            <PlusCircle className="h-4 w-4" />
            Add
        </Button>
    );
}

const columnHelper = createColumnHelper<RentableEquipment>();

export const rentableEquipmentColumns: ColumnDef<RentableEquipment, any>[] = [
    columnHelper.accessor((row) => `${row.brand} ${row.model}`, {
        id: 'equipment',
        header: 'Equipment',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    columnHelper.accessor('equipmentType', {
        header: 'Type',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('lensType', {
        header: 'Lens Type',
        cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
    }),
    columnHelper.accessor('condition', {
        header: 'Condition',
        cell: (info) => {
            const val = info.getValue();
            return <Badge variant="outline" className={conditionBadgeClass[val] ?? ''}>{val}</Badge>;
        },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const val = info.getValue();
            return <Badge variant="outline" className={statusBadgeClass[val] ?? ''}>{val}</Badge>;
        },
    }),
    columnHelper.accessor('rate1Day', {
        header: 'Rate / Day',
        cell: (info) => `RM ${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('rate3Days', {
        header: 'Rate / 3 Days',
        cell: (info) => `RM ${info.getValue().toFixed(2)}`,
    }),
    columnHelper.display({
        id: 'cart',
        header: 'Cart',
        cell: ({ row }) => (
            <CartActionCell
                equipmentId={row.original.mainEquipmentId}
                bookedDates={row.original.bookedDates}
            />
        ),
    }),
];
