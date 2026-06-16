import { useState } from 'react';
import { AlertTriangle, MinusCircle, PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useEquipmentRentalContext } from './context';

// Brand/type lookup for cart items, used to warn on camera↔lens brand mismatches.
export type EquipmentBrandInfo = { brand: string | null; equipmentType: string };

const norm = (b: string | null | undefined) => (b ?? '').trim().toLowerCase();

export function CartActionCell({
    equipmentId,
    equipmentById,
}: {
    equipmentId: number;
    equipmentById?: Map<number, EquipmentBrandInfo>;
}) {
    const { isInCart, addToCart, removeFromCart, startDate, endDate, cartIds } = useEquipmentRentalContext();
    const datesSelected = !!startDate && !!endDate;
    const inCart = isInCart(equipmentId);
    const [warnOpen, setWarnOpen] = useState(false);

    const self = equipmentById?.get(equipmentId);
    const cartEntries = equipmentById
        ? cartIds
            .map((id) => ({ id, info: equipmentById.get(id) }))
            .filter((x): x is { id: number; info: EquipmentBrandInfo } => !!x.info)
        : [];

    const cameraBrandSet = (excludeId?: number) =>
        new Set(
            cartEntries
                .filter((x) => x.info.equipmentType === 'Camera' && x.info.brand && x.id !== excludeId)
                .map((x) => norm(x.info.brand)),
        );
    const cameraBrandList = (excludeId?: number) => [
        ...new Set(
            cartEntries
                .filter((x) => x.info.equipmentType === 'Camera' && x.info.brand && x.id !== excludeId)
                .map((x) => (x.info.brand as string).trim()),
        ),
    ];
    const unmatchedLensBrands = (camSet: Set<string>) => [
        ...new Set(
            cartEntries
                .filter((x) => x.info.equipmentType === 'Lens' && x.info.brand && !camSet.has(norm(x.info.brand)))
                .map((x) => (x.info.brand as string).trim()),
        ),
    ];

    const selfBrand = self?.brand?.trim() || 'this';
    let mismatch = false;
    let mismatchMessage = '';

    if (!inCart && self?.equipmentType === 'Lens') {
        const bodies = cameraBrandList();
        mismatch = bodies.length > 0 && !cameraBrandSet().has(norm(self.brand));
        mismatchMessage = `You're adding a ${selfBrand} lens, but your selected camera ${bodies.length > 1 ? 'bodies are' : 'body is'} ${bodies.join(', ')}. A ${selfBrand} lens may not mount on ${bodies.length > 1 ? 'them' : 'it'}.`;
    } else if (!inCart && self?.equipmentType === 'Camera') {
        const camSet = cameraBrandSet();
        if (self.brand) camSet.add(norm(self.brand));
        const unmatched = unmatchedLensBrands(camSet);
        mismatch = unmatched.length > 0;
        mismatchMessage = `You're adding a ${selfBrand} camera body, but you've selected ${unmatched.join(', ')} ${unmatched.length > 1 ? 'lenses' : 'lens'} that may not mount on it.`;
    } else if (inCart && self?.equipmentType === 'Camera') {
        // Cameras that would remain after removing this one.
        const camSetAfter = cameraBrandSet(equipmentId);
        const unmatched = unmatchedLensBrands(camSetAfter);
        mismatch = camSetAfter.size > 0 && unmatched.length > 0;
        mismatchMessage = `Removing your ${selfBrand} camera body leaves ${unmatched.join(', ')} ${unmatched.length > 1 ? 'lenses' : 'lens'} without a same-brand body in your cart.`;
    }

    const commit = () => (inCart ? removeFromCart(equipmentId) : addToCart(equipmentId));
    const handleClick = () => (mismatch ? setWarnOpen(true) : commit());

    if (!datesSelected) {
        return (
            <Button variant="outline" size="sm" disabled className="text-muted-foreground">
                Select dates
            </Button>
        );
    }

    return (
        <>
            {inCart ? (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive border-destructive hover:bg-destructive/10"
                    onClick={handleClick}
                >
                    <MinusCircle className="h-4 w-4" />
                    Remove
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-primary border-primary hover:bg-primary/10"
                    onClick={handleClick}
                >
                    <PlusCircle className="h-4 w-4" />
                    Add
                </Button>
            )}

            <AlertDialog open={warnOpen} onOpenChange={setWarnOpen}>
                <AlertDialogContent className="text-foreground">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Camera & lens brand mismatch
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {mismatchMessage} Please double-check mount compatibility before continuing.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={commit}>{inCart ? 'Remove anyway' : 'Add anyway'}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
