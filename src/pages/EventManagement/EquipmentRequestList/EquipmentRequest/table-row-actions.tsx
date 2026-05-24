import type { Row } from '@tanstack/react-table';

import type { MainEquipment } from '@/store/schemas/equipment';

import { CartActionCell } from './table-column-def';

type MainEquipmentRowActionsProps = {
    row: Row<MainEquipment>;
};

export function MainEquipmentRowActions({ row }: MainEquipmentRowActionsProps) {
    return <CartActionCell equipmentId={row.original.mainEquipmentId} />;
}
