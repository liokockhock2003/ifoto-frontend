import { Minus, MinusCircle, Plus, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';

import { useRequestLogisticContext } from './context';

// Toggle a main-equipment item in the selected set (mirrors EquipmentRental's CartActionCell).
export function LogisticAddRemoveCell({ equipmentId }: { equipmentId: number }) {
    const { selectedMainIds, addMain, removeMain } = useRequestLogisticContext();
    const selected = selectedMainIds.includes(equipmentId);

    return selected ? (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => removeMain(equipmentId)}
        >
            <MinusCircle className="h-4 w-4" />
            Remove
        </Button>
    ) : (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-primary border-primary hover:bg-primary/10"
            onClick={() => addMain(equipmentId)}
        >
            <PlusCircle className="h-4 w-4" />
            Add
        </Button>
    );
}

// Accessory quantity stepper bound to the selected sub-equipment map.
export function LogisticSubQuantityCell({
    subEquipmentId,
    maxQuantity,
}: {
    subEquipmentId: number;
    maxQuantity: number;
}) {
    const { selectedSubQty, setSubQty } = useRequestLogisticContext();
    const qty = selectedSubQty[subEquipmentId] ?? 0;

    if (maxQuantity === 0) {
        return <Badge variant="outline" className="badge-danger">Fully booked</Badge>;
    }

    return (
        <ButtonGroup>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={qty === 0}
                onClick={() => setSubQty(subEquipmentId, qty - 1)}
            >
                <Minus className="h-3 w-3" />
            </Button>
            <ButtonGroupText className="h-7 px-3 text-sm border-0 min-w-[2rem] justify-center">
                {qty}
            </ButtonGroupText>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={qty >= maxQuantity}
                onClick={() => setSubQty(subEquipmentId, qty + 1)}
            >
                <Plus className="h-3 w-3" />
            </Button>
        </ButtonGroup>
    );
}
