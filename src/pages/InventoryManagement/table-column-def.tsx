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

export const mainEquipmentColumns: ColumnDef<MainEquipment, any>[] = [
    mainColumnHelper.accessor('equipmentType', {
        header: 'Type',
        cell: (info) => info.getValue(),
    }),
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

// ── Sub Equipment columns ─────────────────────────────────────────────────────

const subColumnHelper = createColumnHelper<SubEquipment>();

export const subEquipmentColumns: ColumnDef<SubEquipment, any>[] = [
    subColumnHelper.accessor('equipmentType', {
        header: 'Type',
        cell: (info) => info.getValue(),
    }),
    subColumnHelper.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue(),
    }),
    subColumnHelper.accessor('model', {
        header: 'Model',
        cell: (info) => info.getValue(),
    }),
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
