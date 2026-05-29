import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import type { RentalPricing } from '@/store/schemas/rental-pricing';
import { EQUIPMENT_CONDITION_BADGE } from '@/constants/equipmentCondition';
import { EQUIPMENT_STATUS_BADGE, EQUIPMENT_STATUS_LABEL } from '@/constants/equipmentStatus';

import { CartActionCell, SubEquipmentQuantityCell } from './table-row-actions';


function priceCell(categoryId: number | null | undefined, pricingMap: Map<number, RentalPricing>, field: 'rate1Day' | 'rate3Days' | 'ratePerDayExtra') {
    if (!categoryId) return <span className="text-muted-foreground">—</span>;
    const pricing = pricingMap.get(categoryId);
    if (!pricing) return <span className="text-muted-foreground">—</span>;
    return <span className="tabular-nums">RM {pricing[field].toFixed(2)}</span>;
}

const columnHelper = createColumnHelper<MainEquipment>();

export function createAvailableEquipmentColumns(pricingMap: Map<number, RentalPricing>): ColumnDef<MainEquipment, any>[] {
    return [
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
                return <Badge variant="outline" className={EQUIPMENT_CONDITION_BADGE[val] ?? ''}>{val}</Badge>;
            },
        }),
        columnHelper.display({
            id: 'todayStatus',
            header: 'Status',
            cell: ({ row }) => {
                const s = row.original.status;
                return <Badge variant="outline" className={EQUIPMENT_STATUS_BADGE[s]}>{EQUIPMENT_STATUS_LABEL[s]}</Badge>;
            },
        }),
        columnHelper.display({
            id: 'rate1Day',
            header: '1-Day Rate',
            cell: ({ row }) => priceCell(row.original.pricingCategoryId, pricingMap, 'rate1Day'),
        }),
        columnHelper.display({
            id: 'rate3Days',
            header: '3-Day Rate',
            cell: ({ row }) => priceCell(row.original.pricingCategoryId, pricingMap, 'rate3Days'),
        }),
        columnHelper.display({
            id: 'ratePerDayExtra',
            header: 'Extra Day Rate',
            cell: ({ row }) => priceCell(row.original.pricingCategoryId, pricingMap, 'ratePerDayExtra'),
        }),
        columnHelper.display({
            id: 'cart',
            header: 'Cart',
            cell: ({ row }) => (
                <CartActionCell equipmentId={row.original.mainEquipmentId} />
            ),
        }),
    ];
}

// ── Sub equipment columns ─────────────────────────────────────────────────────

const subColumnHelper = createColumnHelper<SubEquipment>();

export function createAvailableSubEquipmentColumns(pricingMap: Map<number, RentalPricing>): ColumnDef<SubEquipment, any>[] {
    return [
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
            id: 'rate1Day',
            header: '1-Day Rate',
            cell: ({ row }) => priceCell(row.original.pricingCategoryId, pricingMap, 'rate1Day'),
        }),
        subColumnHelper.display({
            id: 'rate3Days',
            header: '3-Day Rate',
            cell: ({ row }) => priceCell(row.original.pricingCategoryId, pricingMap, 'rate3Days'),
        }),
        subColumnHelper.display({
            id: 'ratePerDayExtra',
            header: 'Extra Day Rate',
            cell: ({ row }) => priceCell(row.original.pricingCategoryId, pricingMap, 'ratePerDayExtra'),
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
}
