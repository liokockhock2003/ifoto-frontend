import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { useEquipmentStatuses, useSubEquipmentQuantityHolds } from '@/store/queries/equipment';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import { EQUIPMENT_CONDITION_BADGE } from '@/constants/equipmentCondition';
import { EQUIPMENT_STATUS_BADGE, EQUIPMENT_STATUS_LABEL } from '@/constants/equipmentStatus';

import { MainEquipmentRowActions, SubEquipmentRowActions } from './table-row-actions';

function SchedulesBadge({ id }: { id: number }) {
    const { data } = useEquipmentStatuses(id);
    const count = data?.length ?? 0;
    if (count === 0) return <span className="text-muted-foreground text-xs">—</span>;
    return (
        <Badge variant="outline" className="badge-warning text-xs">
            {count} schedule{count !== 1 ? 's' : ''}
        </Badge>
    );
}

function HoldsBadge({ id }: { id: number }) {
    const { data } = useSubEquipmentQuantityHolds(id);
    const count = data?.length ?? 0;
    if (count === 0) return <span className="text-muted-foreground text-xs">—</span>;
    return (
        <Badge variant="outline" className="badge-warning text-xs">
            {count} schedule{count !== 1 ? 's' : ''}
        </Badge>
    );
}


// ── Main Equipment columns ────────────────────────────────────────────────────

const mainColumnHelper = createColumnHelper<MainEquipment>();

const mainEquipmentBaseColumns: ColumnDef<MainEquipment, any>[] = [
    mainColumnHelper.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue(),
    }),
    mainColumnHelper.accessor('model', {
        header: 'Model',
        cell: (info) => info.getValue(),
    }),
    mainColumnHelper.accessor('serialNumber', {
        header: 'Serial No.',
        cell: (info) => (
            <span className="font-mono text-xs text-muted-foreground">{info.getValue() ?? '—'}</span>
        ),
    }),
    mainColumnHelper.accessor('condition', {
        header: 'Condition',
        cell: (info) => {
            const value = info.getValue();
            return (
                <Badge variant="outline" className={EQUIPMENT_CONDITION_BADGE[value] ?? ''}>
                    {value}
                </Badge>
            );
        },
    }),
    mainColumnHelper.accessor('status', {
        header: 'Today Status',
        cell: ({ row }) => {
            const s = row.original.status;
            return (
                <Badge variant="outline" className={EQUIPMENT_STATUS_BADGE[s]}>
                    {EQUIPMENT_STATUS_LABEL[s]}
                </Badge>
            );
        },
    }),
    mainColumnHelper.accessor('isForRent', {
        header: 'For Rent',
        cell: (info) => (
            <Badge variant="outline" className={info.getValue() ? 'badge-success' : ''}>
                {info.getValue() ? 'Yes' : 'No'}
            </Badge>
        ),
    }),
    mainColumnHelper.accessor('problems', {
        header: 'Notes',
        cell: (info) => (
            <span className="text-sm text-muted-foreground">{info.getValue() || '—'}</span>
        ),
    }),
    mainColumnHelper.display({
        id: 'statusIndicator',
        header: 'Schedules',
        cell: ({ row }) => <SchedulesBadge id={row.original.mainEquipmentId} />,
    }),
    mainColumnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <MainEquipmentRowActions row={row} />,
    }),
];

export const cameraColumns: ColumnDef<MainEquipment, any>[] = mainEquipmentBaseColumns;

export const lensColumns: ColumnDef<MainEquipment, any>[] = [
    mainColumnHelper.accessor('lensType', {
        header: 'Lens Type',
        cell: (info) => info.getValue() ?? '—',
    }),
    ...mainEquipmentBaseColumns,
];

// ── Sub Equipment columns ─────────────────────────────────────────────────────

const subColumnHelper = createColumnHelper<SubEquipment>();

const subEquipmentQuantityColumns: ColumnDef<SubEquipment, any>[] = [
    subColumnHelper.accessor('totalQuantity', {
        header: 'Total',
        cell: (info) => info.getValue(),
    }),
    subColumnHelper.accessor('committedQuantity', {
        header: 'Booked Today',
        cell: (info) => {
            const value: number = info.getValue();
            return (
                <Badge variant="outline" className={value > 0 ? 'badge-warning' : ''}>
                    {value}
                </Badge>
            );
        },
    }),
    subColumnHelper.accessor('adminHeldQuantity', {
        header: 'Admin Held Today',
        cell: (info) => {
            const value: number = info.getValue() ?? 0;
            if (value === 0) return <span className="text-muted-foreground text-xs">—</span>;
            return (
                <Badge variant="outline" className="badge-warning">
                    {value}
                </Badge>
            );
        },
    }),
    subColumnHelper.accessor('availableQuantity', {
        header: 'Available Today',
        cell: (info) => {
            const value: number = info.getValue();
            return (
                <Badge variant="outline" className={value > 0 ? 'badge-success' : 'badge-danger'}>
                    {value}
                </Badge>
            );
        },
    }),
    subColumnHelper.accessor('notes', {
        header: 'Notes',
        cell: (info) => (
            <span className="text-sm text-muted-foreground">{info.getValue() || '—'}</span>
        ),
    }),
    subColumnHelper.display({
        id: 'holdsIndicator',
        header: 'Schedules',
        cell: ({ row }) => <HoldsBadge id={row.original.subEquipmentId} />,
    }),
    subColumnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <SubEquipmentRowActions row={row} />,
    }),
];

export const subEquipmentColumns: ColumnDef<SubEquipment, any>[] = [
    subColumnHelper.accessor('equipmentType', {
        header: 'Category',
        cell: (info) => info.getValue(),
    }),
    subColumnHelper.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue() ?? <span className="text-muted-foreground">—</span>,
    }),
    ...subEquipmentQuantityColumns,
];

const cameraModelColumn: ColumnDef<SubEquipment, any> = subColumnHelper.accessor('cameraModel', {
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

export const batteryColumns: ColumnDef<SubEquipment, any>[] = [
    subColumnHelper.accessor('equipmentType', {
        header: 'Brand',
        cell: (info) => info.getValue(),
    }),
    cameraModelColumn,
    ...subEquipmentQuantityColumns,
];

export const speedlightColumns: ColumnDef<SubEquipment, any>[] = [
    ...subEquipmentQuantityColumns,
];

export const sdCfCardColumns: ColumnDef<SubEquipment, any>[] = [
    subColumnHelper.accessor('equipmentType', {
        header: 'Type',
        cell: (info) => info.getValue(),
    }),
    subColumnHelper.accessor('capacity', {
        header: 'Capacity (GB)',
        cell: (info) => info.getValue(),
    }),
    ...subEquipmentQuantityColumns,
];

export const tripodColumns: ColumnDef<SubEquipment, any>[] = [
    ...subEquipmentQuantityColumns,
];

export const lainLainColumns: ColumnDef<SubEquipment, any>[] = [
    subColumnHelper.accessor('equipmentType', {
        header: 'Item',
        cell: (info) => info.getValue(),
    }),
    ...subEquipmentQuantityColumns,
];
