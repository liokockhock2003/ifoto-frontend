import { AvailableEquipmentTables, MAIN_EQUIPMENT_FILTERS } from '@/components/available-equipment-tables';
import { Card, CardContent } from '@/components/ui/card';

import { useRentalLogisticContext } from './context';
import { createLogisticEquipmentColumns, createLogisticSubEquipmentColumns } from './table-column-def';

export function AvailableEquipment() {
    const {
        selectedRental,
        mode,
        availableEquipment,
        availableSubEquipment,
        isAvailableEquipmentLoading,
    } = useRentalLogisticContext();

    if (!selectedRental || mode === 'view') {
        return (
            <Card className="shadow-sm">
                <CardContent className="flex h-32 items-center justify-center text-center text-sm text-muted-foreground">
                    {selectedRental
                        ? 'This rental is read-only.'
                        : 'Select a rental to see equipment available for its dates.'}
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
