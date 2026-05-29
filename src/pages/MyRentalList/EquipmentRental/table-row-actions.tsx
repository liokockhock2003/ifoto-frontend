import { Minus, MinusCircle, Plus, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupText } from '@/components/ui/button-group';

import { useEquipmentRentalContext } from './context';

export function SubEquipmentQuantityCell({
    subEquipmentId,
    availableQuantity,
}: {
    subEquipmentId: number;
    availableQuantity: number;
}) {
    const { subQty, setSubQty, startDate, endDate } = useEquipmentRentalContext();
    const qty = subQty[subEquipmentId] ?? 0;

    if (!startDate || !endDate) {
        return (
            <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                Select dates
            </Button>
        );
    }

    if (availableQuantity === 0) {
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
                disabled={qty >= availableQuantity}
                onClick={() => setSubQty(subEquipmentId, qty + 1)}
            >
                <Plus className="h-3 w-3" />
            </Button>
        </ButtonGroup>
    );
}

export function CartActionCell({ equipmentId }: { equipmentId: number }) {
    const { isInCart, addToCart, removeFromCart, startDate, endDate } = useEquipmentRentalContext();
    const datesSelected = !!startDate && !!endDate;
    const inCart = isInCart(equipmentId);

    if (!datesSelected) {
        return (
            <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                Select dates
            </Button>
        );
    }

    return inCart ? (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => removeFromCart(equipmentId)}
        >
            <MinusCircle className="h-4 w-4" />
            Remove
        </Button>
    ) : (
        <Button
            variant="outline"
            size="sm"
            className="gap-1 text-primary border-primary hover:bg-primary/10"
            onClick={() => addToCart(equipmentId)}
        >
            <PlusCircle className="h-4 w-4" />
            Add
        </Button>
    );
}
