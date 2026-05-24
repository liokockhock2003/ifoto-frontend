import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { EquipmentStatusType, MainEquipment, SubEquipment } from '@/store/schemas/equipment';

import { CartActionCell, SubEquipmentQuantityCell } from './table-row-actions';

const conditionBadgeClass: Record<string, string> = {
    Excellent: 'badge-success',
    Good: 'badge-info',
    Fair: 'badge-warning',
    Poor: 'badge-danger',
};

const statusBadgeClass: Record<EquipmentStatusType, string> = {
    AVAILABLE:   'badge-success',
    MAINTENANCE: 'badge-warning',
    UNAVAILABLE: 'badge-danger',
    CONVOCATION: 'badge-info',
    MRM:         'badge-info',
};

const statusLabel: Record<EquipmentStatusType, string> = {
    AVAILABLE:   'Available',
    MAINTENANCE: 'Maintenance',
    UNAVAILABLE: 'Unavailable',
    CONVOCATION: 'Convocation',
    MRM:         'MRM Event',
};

function todayStatusType(dateStatuses: MainEquipment['dateStatuses']): EquipmentStatusType {
    const today = new Date().toLocaleDateString('en-CA');
    const match = dateStatuses?.find((s) => s.startDate <= today && s.endDate >= today);
    return match ? match.statusType : 'AVAILABLE';
}

const columnHelper = createColumnHelper<MainEquipment>();

export const availableEquipmentColumns: ColumnDef<MainEquipment, any>[] = [
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
    columnHelper.display({
        id: 'todayStatus',
        header: 'Status',
        cell: ({ row }) => {
            const s = todayStatusType(row.original.dateStatuses);
            return <Badge variant="outline" className={statusBadgeClass[s]}>{statusLabel[s]}</Badge>;
        },
    }),
    columnHelper.display({
        id: 'cart',
        header: 'Cart',
        cell: ({ row }) => (
            <CartActionCell equipmentId={row.original.mainEquipmentId} />
        ),
    }),
];

// ── Sub equipment columns ─────────────────────────────────────────────────────

const subColumnHelper = createColumnHelper<SubEquipment>();

export const availableSubEquipmentColumns: ColumnDef<SubEquipment, any>[] = [
    subColumnHelper.accessor('equipmentType', {
        header: 'Type',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    subColumnHelper.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
    }),
    subColumnHelper.accessor('availableQuantity', {
        header: 'Available',
        cell: (info) => {
            const val = info.getValue();
            return (
                <span className={`font-medium ${val === 0 ? 'text-destructive' : 'text-primary'}`}>
                    {val} / {info.row.original.totalQuantity}
                </span>
            );
        },
    }),
    subColumnHelper.display({
        id: 'quantity',
        header: 'Quantity',
        cell: ({ row }) => (
            <SubEquipmentQuantityCell
                subEquipmentId={row.original.subEquipmentId}
                availableQuantity={row.original.availableQuantity ?? 0}
            />
        ),
    }),
];
