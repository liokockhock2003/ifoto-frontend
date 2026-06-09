import { createContext, useContext } from 'react';

import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

export type EquipmentRequestContextValue = {
    // Equipment catalog
    mainEquipment: MainEquipment[];
    subEquipment: SubEquipment[];
    isEquipmentLoading: boolean;

    // Cart state
    cartIds: number[];
    startDate: string;
    endDate: string;
    notes: string;
    eventId: number;

    // Sub-equipment quantities
    subQty: Record<number, number>;
    setSubQty: (id: number, qty: number) => void;

    // Cart methods
    addToCart: (id: number) => void;
    removeFromCart: (id: number) => void;
    isInCart: (id: number) => boolean;
    setNotes: (n: string) => void;
    clearCart: () => void;
};

export const EquipmentRequestContext = createContext<EquipmentRequestContextValue | undefined>(
    undefined,
);

export function useEquipmentRequestContext(): EquipmentRequestContextValue {
    const context = useContext(EquipmentRequestContext);
    if (!context) {
        throw new Error('useEquipmentRequestContext must be used within <EquipmentRequestProvider>');
    }
    return context;
}
