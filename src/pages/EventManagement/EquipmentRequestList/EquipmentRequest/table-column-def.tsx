import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MinusCircle, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EquipmentStatusType, MainEquipment, SubEquipment } from '@/store/schemas/equipment';

import { useEquipmentRequestContext } from './context';

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

export function CartActionCell({ equipmentId }: { equipmentId: number }) {
    const { addToCart, removeFromCart, isInCart } = useEquipmentRequestContext();
    const inCart = isInCart(equipmentId);

    return inCart ? (
        <Button
            type="button"
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
            type="button"
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

// ── Main equipment columns ────────────────────────────────────────────────────

const mainCol = createColumnHelper<MainEquipment>();

const mainEquipmentBaseColumns: ColumnDef<MainEquipment, any>[] = [
    mainCol.accessor((row) => `${row.brand} ${row.model}`, {
        id: 'equipment',
        header: 'Equipment',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    mainCol.accessor('serialNumber', {
        header: 'Serial No.',
        cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    mainCol.accessor('condition', {
        header: 'Condition',
        cell: (info) => {
            const val = info.getValue();
            return <Badge variant="outline" className={conditionBadgeClass[val] ?? ''}>{val}</Badge>;
        },
    }),
    mainCol.display({
        id: 'todayStatus',
        header: 'Status',
        cell: ({ row }) => {
            const s = todayStatusType(row.original.dateStatuses);
            return <Badge variant="outline" className={statusBadgeClass[s]}>{statusLabel[s]}</Badge>;
        },
    }),
    mainCol.display({
        id: 'cart',
        header: 'Cart',
        cell: ({ row }) => <CartActionCell equipmentId={row.original.mainEquipmentId} />,
    }),
];

export const cameraColumns: ColumnDef<MainEquipment, any>[] = mainEquipmentBaseColumns;

export const lensColumns: ColumnDef<MainEquipment, any>[] = [
    mainCol.accessor('lensType', {
        header: 'Lens Type',
        cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
    }),
    ...mainEquipmentBaseColumns,
];

// ── Sub equipment columns (display only) ─────────────────────────────────────

const subCol = createColumnHelper<SubEquipment>();

export const subEquipmentColumns: ColumnDef<SubEquipment, any>[] = [
    subCol.accessor('equipmentType', {
        header: 'Type',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    subCol.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue() ?? '—',
    }),
    subCol.accessor('totalQuantity', {
        header: 'Total',
        cell: (info) => info.getValue(),
    }),
    subCol.accessor('availableQuantity', {
        header: 'Available',
        cell: (info) => <span className="font-medium text-primary">{info.getValue()}</span>,
    }),
];
