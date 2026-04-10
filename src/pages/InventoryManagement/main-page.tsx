import { useState } from 'react';
import { Package, Plus } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useInventoryManagementContext } from './context';
import { MainEquipmentCreateDialog, SubEquipmentCreateDialog } from './dialog-create';
import { InventoryManagementProvider } from './provider';
import { mainEquipmentColumns, subEquipmentColumns } from './table-column-def';

function InventoryManagementContent() {
    const {
        mainEquipment,
        subEquipment,
        totalMainEquipment,
        totalSubEquipment,
        isLoading,
        isError,
        error,
        refetch,
    } = useInventoryManagementContext();

    const [openCreateMain, setOpenCreateMain] = useState(false);
    const [openCreateSub, setOpenCreateSub] = useState(false);
    const [activeTab, setActiveTab] = useState('main');

    return (
        <div className="space-y-6 p-2 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl text-primary font-semibold tracking-tight">Inventory Management</h1>
                    <p className="text-sm text-muted-foreground">Manage All Kelab Fotokreatif Equipment</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between">
                    <TabsList className="bg-primary/10 border border-primary/20">
                        <TabsTrigger
                            value="main"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                            Main Equipment
                        </TabsTrigger>
                        <TabsTrigger
                            value="sub"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
                        >
                            Sub Equipment
                        </TabsTrigger>
                    </TabsList>

                    {activeTab === 'main' ? (
                        <Button type="button" size="sm" onClick={() => setOpenCreateMain(true)}>
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Equipment</span>
                        </Button>
                    ) : (
                        <Button type="button" size="sm" onClick={() => setOpenCreateSub(true)}>
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add Sub-Equipment</span>
                        </Button>
                    )}
                </div>

                <TabsContent value="main">
                    <DataTable
                        columns={mainEquipmentColumns}
                        data={mainEquipment}
                        isLoading={isLoading}
                        isError={isError}
                        error={error ?? undefined}
                        onRetry={() => void refetch()}
                        title="Main Equipment"
                        totalElements={totalMainEquipment}
                        emptyMessage="No main equipment found."
                    />
                </TabsContent>

                <TabsContent value="sub">
                    <DataTable
                        columns={subEquipmentColumns}
                        data={subEquipment}
                        isLoading={isLoading}
                        isError={isError}
                        error={error ?? undefined}
                        onRetry={() => void refetch()}
                        title="Sub Equipment"
                        totalElements={totalSubEquipment}
                        emptyMessage="No sub equipment found."
                    />
                </TabsContent>
            </Tabs>

            <MainEquipmentCreateDialog
                open={openCreateMain}
                onOpenChange={setOpenCreateMain}
            />
            <SubEquipmentCreateDialog
                open={openCreateSub}
                onOpenChange={setOpenCreateSub}
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
