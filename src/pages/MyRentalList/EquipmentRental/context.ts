import { createContext, useContext } from 'react';

interface EquipmentRentalContextValue {
    cartIds: number[];
    startDate: string;
    endDate: string;
    notes: string;
    addToCart: (id: number) => void;
    removeFromCart: (id: number) => void;
    clearCart: () => void;
    setStartDate: (d: string) => void;
    setEndDate: (d: string) => void;
    setNotes: (n: string) => void;
    isInCart: (id: number) => boolean;
}

export const EquipmentRentalContext = createContext<EquipmentRentalContextValue | null>(null);

export function useEquipmentRentalContext() {
    const ctx = useContext(EquipmentRentalContext);
    if (!ctx) throw new Error('useEquipmentRentalContext must be used within EquipmentRentalProvider');
    return ctx;
}
