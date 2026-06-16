import { useState } from 'react';
import { BadgeDollarSign, Package, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { type ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/data-table';
import { ExpandableDataTable, type FilterDef } from '@/components/expandable-data-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import type { EquipmentStatusType, SubEquipment } from '@/store/schemas/equipment';
import { EQUIPMENT_CONDITIONS, CONDITION_LABEL } from '@/constants/equipmentCondition';
import { EQUIPMENT_STATUS_LABEL } from '@/constants/equipmentStatus';

import { useInventoryManagementContext } from './context';
import { MainEquipmentCreateDialog, SubEquipmentCreateDialog } from './dialog-create';
import {
    InventoryManagementProvider,
    MAIN_EQUIPMENT_CONFIG,
    MAIN_EQUIPMENT_KEYS,
    SUB_EQUIPMENT_CONFIG,
    SUB_EQUIPMENT_KEYS,
} from './provider';
import {
    batteryColumns,
    cameraColumns,
    lainLainColumns,
    lensColumns,
    sdCfCardColumns,
    speedlightColumns,
    subEquipmentColumns,
    tripodColumns,
} from './table-column-def';

// ── Tab config (derived from provider configs) ────────────────────────────────

type TabValue = keyof typeof MAIN_EQUIPMENT_CONFIG | keyof typeof SUB_EQUIPMENT_CONFIG;
type SubEquipmentTabValue = keyof typeof SUB_EQUIPMENT_CONFIG;

const TABS: { value: TabValue; label: string }[] = [
    ...MAIN_EQUIPMENT_KEYS.map((value) => ({ value, label: MAIN_EQUIPMENT_CONFIG[value].label })),
    ...SUB_EQUIPMENT_KEYS.map((value) => ({ value, label: SUB_EQUIPMENT_CONFIG[value].label })),
];

const MAIN_TAB_SET = new Set<string>(MAIN_EQUIPMENT_KEYS);
const SUB_TAB_SET = new Set<string>(SUB_EQUIPMENT_KEYS);

// Condition + today-status filters for the main-equipment (camera/lens) tables.
const MAIN_EQUIPMENT_FILTERS: FilterDef[] = [
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

const SUB_TAB_COLUMNS: Partial<Record<SubEquipmentTabValue, ColumnDef<SubEquipment, any>[]>> = {
    batteryCameras: batteryColumns,
    chargerBatteries: batteryColumns,
    speedlights: speedlightColumns,
    sdCfCards: sdCfCardColumns,
    tripods: tripodColumns,
    lainLain: lainLainColumns,
};

// ── Page content ──────────────────────────────────────────────────────────────

function InventoryManagementContent() {
    const ctx = useInventoryManagementContext();
    const navigate = useNavigate();

    const [openCreateMain, setOpenCreateMain] = useState(false);
    const [openCreateSub, setOpenCreateSub] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('cameras');

    const activeKind = MAIN_TAB_SET.has(activeTab) ? 'main' : 'sub';
    const activeLabel = TABS.find((t) => t.value === activeTab)?.label ?? '';

    return (
        <div className="space-y-6 p-2 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">Inventory Management</h1>
                        <p className="text-sm text-muted-foreground">Manage Kelab Fotokreatif's Photography Equipments</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="text-muted-foreground" onClick={() => navigate('/manage-inventory/rental-pricing')}>
                    <BadgeDollarSign className="h-4 w-4" />
                    <span className="hidden sm:inline">Rental Pricing</span>
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
                <div className="flex items-center justify-between gap-4">
                    <PrimaryTabsList>
                        {TABS.map((tab) => (
                            <PrimaryTabsTrigger key={tab.value} value={tab.value}>
                                {tab.label}
                            </PrimaryTabsTrigger>
                        ))}
                    </PrimaryTabsList>

                    <Button
                        type="button"
                        size="sm"
                        onClick={() => activeKind === 'main' ? setOpenCreateMain(true) : setOpenCreateSub(true)}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Add {activeLabel}</span>
                    </Button>
                </div>

                <TabsContent value="cameras">
                    <ExpandableDataTable
                        columns={cameraColumns}
                        data={ctx.cameras}
                        isLoading={ctx.isLoading}
                        title="Cameras"
                        groupBy={(row) => row.brand || null}
                        searchable
                        filters={MAIN_EQUIPMENT_FILTERS}
                    />
                </TabsContent>

                <TabsContent value="lenses">
                    <ExpandableDataTable
                        columns={lensColumns}
                        data={ctx.lenses}
                        isLoading={ctx.isLoading}
                        title="Lenses"
                        groupBy={(row) => row.brand || null}
                        searchable
                        filters={MAIN_EQUIPMENT_FILTERS}
                    />
                </TabsContent>

                {TABS.filter((t) => SUB_TAB_SET.has(t.value)).map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                        <DataTable
                            columns={SUB_TAB_COLUMNS[tab.value as SubEquipmentTabValue] ?? subEquipmentColumns}
                            data={ctx[tab.value] as SubEquipment[]}
                            isLoading={ctx.isLoading}
                            isError={ctx.isError}
                            error={ctx.error ?? undefined}
                            onRetry={() => void ctx.refetch()}
                            title={tab.label}
                            totalElements={(ctx[tab.value] as SubEquipment[]).length}
                            emptyMessage={`No ${tab.label.toLowerCase()} found.`}
                        />
                    </TabsContent>
                ))}
            </Tabs>

            <MainEquipmentCreateDialog
                open={openCreateMain}
                onOpenChange={setOpenCreateMain}
                equipmentKind={MAIN_TAB_SET.has(activeTab) ? (activeTab as keyof typeof MAIN_EQUIPMENT_CONFIG) : 'cameras'}
            />
            <SubEquipmentCreateDialog
                open={openCreateSub}
                onOpenChange={setOpenCreateSub}
                equipmentKind={SUB_TAB_SET.has(activeTab) ? (activeTab as SubEquipmentTabValue) : SUB_EQUIPMENT_KEYS[0]}
            />
        </div>
    );
}

export default function InventoryManagementMainPage() {
    return (
        <InventoryManagementProvider>
            <InventoryManagementContent />
        </InventoryManagementProvider>
    );
}
