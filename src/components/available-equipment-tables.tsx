import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';

import { ExpandableDataTable, type FilterDef } from '@/components/expandable-data-table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import { EQUIPMENT_CONDITIONS, CONDITION_LABEL } from '@/constants/equipmentCondition';
import { EQUIPMENT_STATUS_LABEL } from '@/constants/equipmentStatus';
import type { EquipmentStatusType, MainEquipment, SubEquipment } from '@/store/schemas/equipment';

// Condition + status filters for the main-equipment tabs. The column ids in the caller's
// column defs must be `condition` / `status` for ExpandableDataTable to bind these.
export const MAIN_EQUIPMENT_FILTERS: FilterDef[] = [
    {
        id: 'condition',
        label: 'Condition',
        options: EQUIPMENT_CONDITIONS.map((c) => ({ value: c, label: CONDITION_LABEL[c] ?? c })),
    },
    {
        id: 'status',
        label: 'Status',
        options: (Object.keys(EQUIPMENT_STATUS_LABEL) as EquipmentStatusType[]).map((s) => ({
            value: s,
            label: EQUIPMENT_STATUS_LABEL[s],
        })),
    },
];

// Top-level categories — mirrors InventoryManagement/provider.tsx
// MAIN_EQUIPMENT_CONFIG / SUB_EQUIPMENT_CONFIG (keep in sync).
const MAIN_CATEGORIES = [
    { label: 'Camera', equipmentType: 'Camera' },
    { label: 'Lens', equipmentType: 'Lens' },
] as const;

const SUB_CATEGORIES = [
    { label: 'Battery Camera', typeValue: 'Battery Camera' },
    { label: 'Charger Battery', typeValue: 'Charger Battery' },
    { label: 'Speedlight', typeValue: 'Speedlight' },
    { label: 'SD Card / CF Card', typeValue: 'SD Card/CF Card' },
    { label: 'Tripod', typeValue: 'Tripod' },
    { label: 'Others', typeValue: 'Lain-Lain' },
] as const;

type AvailableEquipmentTablesProps = {
    mainEquipment: MainEquipment[];
    subEquipment: SubEquipment[];
    isLoading?: boolean;
    cameraColumns: ColumnDef<MainEquipment, any>[];
    lensColumns: ColumnDef<MainEquipment, any>[];
    subColumns: ColumnDef<SubEquipment, any>[];
    mainFilters?: FilterDef[];
};

// Erased row type so Camera/Lens (MainEquipment) and accessory (SubEquipment) tabs can
// live in one list without union-inference fighting ExpandableDataTable's generic.
type TabDef = {
    label: string;
    columns: ColumnDef<any, any>[];
    data: Array<{ brand: string | null }>;
    filters?: FilterDef[];
};

export function AvailableEquipmentTables({
    mainEquipment,
    subEquipment,
    isLoading,
    cameraColumns,
    lensColumns,
    subColumns,
    mainFilters,
}: AvailableEquipmentTablesProps) {
    // Main tabs (Camera, Lens) always show; accessory tabs only when they have items.
    const mainTabs = useMemo<TabDef[]>(
        () =>
            MAIN_CATEGORIES.map((c) => ({
                label: c.label,
                columns: c.equipmentType === 'Lens' ? lensColumns : cameraColumns,
                data: mainEquipment.filter((e) => e.equipmentType === c.equipmentType),
                filters: mainFilters,
            })),
        [mainEquipment, cameraColumns, lensColumns, mainFilters],
    );

    const subTabs = useMemo<TabDef[]>(
        () =>
            SUB_CATEGORIES.map((c) => ({
                label: c.label,
                columns: subColumns,
                data: subEquipment.filter((e) => e.type === c.typeValue),
            })).filter((t) => t.data.length > 0),
        [subEquipment, subColumns],
    );

    const tabs: TabDef[] = [...mainTabs, ...subTabs];
    const visibleKey = tabs.map((t) => t.label).join(',');

    return (
        <Tabs defaultValue={tabs[0]?.label} key={visibleKey}>
            <PrimaryTabsList>
                {tabs.map((t) => (
                    <PrimaryTabsTrigger key={t.label} value={t.label}>
                        {t.label} ({t.data.length})
                    </PrimaryTabsTrigger>
                ))}
            </PrimaryTabsList>

            {tabs.map((t) => (
                <TabsContent key={t.label} value={t.label}>
                    <ExpandableDataTable
                        columns={t.columns}
                        data={t.data}
                        title={t.label}
                        isLoading={isLoading}
                        groupBy={(row) => row.brand || null}
                        searchable
                        filters={t.filters}
                    />
                </TabsContent>
            ))}
        </Tabs>
    );
}
