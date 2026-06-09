import { createContext, useContext } from 'react';

import type { RentalPricing } from '@/store/schemas/rental-pricing';

export type RentalPricingContextValue = {
    studentPricing: RentalPricing[];
    nonStudentPricing: RentalPricing[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;
};

export const RentalPricingContext = createContext<RentalPricingContextValue | undefined>(undefined);

export function useRentalPricingContext(): RentalPricingContextValue {
    const context = useContext(RentalPricingContext);
    if (!context) {
        throw new Error('useRentalPricingContext must be used within <RentalPricingProvider>');
    }
    return context;
}
