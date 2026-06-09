import { AvailableEquipmentTables, MAIN_EQUIPMENT_FILTERS } from '@/components/available-equipment-tables';
import { Card, CardContent } from '@/components/ui/card';

import { useRequestLogisticContext } from './context';
import { createLogisticEquipmentColumns, createLogisticSubEquipmentColumns } from './table-column-def';

export function AvailableEquipment() {
    const {
        selectedRequest,
        mode,
        availableEquipment,
        availableSubEquipment,
        isAvailableEquipmentLoading,
    } = useRequestLogisticContext();

    if (!selectedRequest || mode === 'view') {
        return (
            <Card className="shadow-sm">
                <CardContent className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
                    {selectedRequest
                        ? 'This request is read-only.'
                        : 'Select a request to see equipment available for its dates.'}
                </CardContent>
            </Card>
        );
    }

    return (
        <AvailableEquipmentTables
            mainEquipment={availableEquipment}
            subEquipment={availableSubEquipment}
            isLoading={isAvailableEquipmentLoading}
            cameraColumns={createLogisticEquipmentColumns()}
            lensColumns={createLogisticEquipmentColumns({ showLensType: true })}
            subColumns={createLogisticSubEquipmentColumns()}
            mainFilters={MAIN_EQUIPMENT_FILTERS}
        />
    );
}
