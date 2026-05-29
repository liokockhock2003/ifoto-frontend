import type { Row } from '@tanstack/react-table';
import { MinusCircle, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

import { useEquipmentRequestContext } from './context';
import { CartActionCell } from './table-column-def';

type MainEquipmentRowActionsProps = {
    row: Row<MainEquipment>;
};

export function MainEquipmentRowActions({ row }: MainEquipmentRowActionsProps) {
    return <CartActionCell equipmentId={row.original.mainEquipmentId} />;
}

type SubEquipmentRowActionsProps = {
    row: Row<SubEquipment>;
};

export function SubEquipmentRowActions({ row }: SubEquipmentRowActionsProps) {
    return (
        <SubEquipmentQuantityCell
            subEquipmentId={row.original.subEquipmentId}
            availableQuantity={row.original.availableQuantity}
        />
    );
}

export function SubEquipmentQuantityCell({
    subEquipmentId,
    availableQuantity,
}: {
    subEquipmentId: number;
    availableQuantity: number;
}) {
    const { subQty, setSubQty } = useEquipmentRequestContext();
    const qty = subQty[subEquipmentId] ?? 0;

    if (availableQuantity === 0) {
        return <Badge variant="outline" className="badge-danger">Fully booked</Badge>;
    }

    return (
        <div className="flex items-center gap-1">
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={qty === 0}
                onClick={() => setSubQty(subEquipmentId, qty - 1)}
            >
                <MinusCircle className="h-3.5 w-3.5" />
            </Button>
            <span className="w-6 text-center text-sm font-medium tabular-nums">{qty}</span>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={qty >= availableQuantity}
                onClick={() => setSubQty(subEquipmentId, qty + 1)}
            >
                <PlusCircle className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
