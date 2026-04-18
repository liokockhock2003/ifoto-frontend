import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

import { MainEquipmentRowActions, SubEquipmentRowActions } from './table-row-actions';

// ── Badge class maps (semantic CSS classes from index.css — dark mode safe) ────

const conditionBadgeClass: Record<string, string> = {
    Excellent: 'badge-success',
    Good:      'badge-info',
    Fair:      'badge-warning',
    Poor:      'badge-danger',
};

const statusBadgeClass: Record<string, string> = {
    Available:   'badge-success',
    'In Use':    'badge-info',
    Maintenance: 'badge-warning',
    Unavailable: 'badge-danger',
};

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
            <span className="font-mono text-xs text-muted-foreground">{info.getValue()}</span>
        ),
    }),
    mainColumnHelper.accessor('condition', {
        header: 'Condition',
        cell: (info) => {
            const value: string = info.getValue();
            return (
                <Badge variant="outline" className={conditionBadgeClass[value] ?? ''}>
                    {value}
                </Badge>
            );
        },
    }),
    mainColumnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
            const value: string = info.getValue();
            return (
                <Badge variant="outline" className={statusBadgeClass[value] ?? ''}>
                    {value}
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
    mainColumnHelper.accessor('notes', {
        header: 'Notes',
        cell: (info) => (
            <span className="text-sm text-muted-foreground">{info.getValue() || '—'}</span>
        ),
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
    subColumnHelper.accessor('usedQuantity', {
        header: 'In Use',
        cell: (info) => info.getValue(),
    }),
    subColumnHelper.accessor('availableQuantity', {
        header: 'Available',
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
