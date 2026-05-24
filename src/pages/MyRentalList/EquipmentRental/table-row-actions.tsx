import { MinusCircle, PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
