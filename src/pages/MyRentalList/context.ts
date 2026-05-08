import { createContext, useContext } from 'react';
import type { Rental } from '@/store/schemas/rental';

export interface RentalListContextValue {
    data: Rental[] | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => void;
}

export const RentalListContext = createContext<RentalListContextValue | null>(null);

export function useRentalListContext(): RentalListContextValue {
    const ctx = useContext(RentalListContext);
    if (!ctx) throw new Error('useRentalListContext must be used within RentalListProvider');
    return ctx;
}
