import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { MinusCircle, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import { EQUIPMENT_CONDITION_BADGE } from '@/constants/equipmentCondition';
import { EQUIPMENT_STATUS_BADGE, EQUIPMENT_STATUS_LABEL } from '@/constants/equipmentStatus';

import { useEquipmentRequestContext } from './context';


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
            return <Badge variant="outline" className={EQUIPMENT_CONDITION_BADGE[val] ?? ''}>{val}</Badge>;
        },
    }),
    mainCol.display({
        id: 'todayStatus',
        header: 'Status',
        cell: ({ row }) => {
            const s = row.original.status;
            return <Badge variant="outline" className={EQUIPMENT_STATUS_BADGE[s]}>{EQUIPMENT_STATUS_LABEL[s]}</Badge>;
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

// ── Sub-equipment columns (per type, with quantity cell) ──────────────────────

const subCol = createColumnHelper<SubEquipment>();

const availableColumn: ColumnDef<SubEquipment, any> = subCol.accessor('availableQuantity', {
    header: 'Available',
    cell: (info) => {
        const value: number = info.getValue();
        return (
            <Badge variant="outline" className={value > 0 ? 'badge-success' : 'badge-danger'}>
                {value}
            </Badge>
        );
    },
});

const quantityCell: ColumnDef<SubEquipment, any> = subCol.display({
    id: 'qty',
    header: 'Quantity',
    cell: ({ row }) => {
        // Rendered inline to keep column defs static (no closure over context)
        return (
            <SubEquipmentQtyCellInline
                subEquipmentId={row.original.subEquipmentId}
                availableQuantity={row.original.availableQuantity}
            />
        );
    },
});

function SubEquipmentQtyCellInline({
    subEquipmentId,
    availableQuantity,
}: {
    subEquipmentId: number;
    availableQuantity: number;
}) {
    const { subQty, setSubQty } = useEquipmentRequestContext();
    const qty = subQty[subEquipmentId] ?? 0;

    if (availableQuantity === 0) {
        return <Badge variant="outline" className="badge-danger">Fully booked</Badge>;
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={qty === 0}
                onClick={() => setSubQty(subEquipmentId, qty - 1)}
            >
                <MinusCircle className="h-3.5 w-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={qty >= availableQuantity}
                onClick={() => setSubQty(subEquipmentId, qty + 1)}
            >
                <PlusCircle className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

const cameraModelColumn: ColumnDef<SubEquipment, any> = subCol.accessor('cameraModel', {
    header: 'Camera Model',
    cell: (info) => {
        const models = info.getValue();
        if (!models?.length) return <span className="text-muted-foreground">—</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {models.map((m: string) => (
                    <Badge key={m} variant="outline">{m}</Badge>
                ))}
            </div>
        );
    },
});

export const requestBatteryColumns: ColumnDef<SubEquipment, any>[] = [
    subCol.accessor('equipmentType', {
        header: 'Brand',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    cameraModelColumn,
    availableColumn,
    quantityCell,
];

export const requestSpeedlightColumns: ColumnDef<SubEquipment, any>[] = [
    availableColumn,
    quantityCell,
];

export const requestSdCfCardColumns: ColumnDef<SubEquipment, any>[] = [
    subCol.accessor('equipmentType', {
        header: 'Card Type',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    subCol.accessor('capacity', {
        header: 'Capacity (GB)',
        cell: (info) => info.getValue(),
    }),
    availableColumn,
    quantityCell,
];

export const requestTripodColumns: ColumnDef<SubEquipment, any>[] = [
    availableColumn,
    quantityCell,
];

export const requestLainLainColumns: ColumnDef<SubEquipment, any>[] = [
    subCol.accessor('equipmentType', {
        header: 'Item',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    availableColumn,
    quantityCell,
];
