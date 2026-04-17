import { useMemo, type ReactNode } from 'react';

import { useRentalPricingList } from '@/store/queries/rental-pricing';

import { RentalPricingContext } from './context';

type RentalPricingProviderProps = { children: ReactNode };

export function RentalPricingProvider({ children }: RentalPricingProviderProps) {
    const query = useRentalPricingList();

    const value = useMemo(() => {
        const all = query.data ?? [];
        return {
            studentPricing:    all.filter((p) => p.memberType === 'STUDENT'),
            nonStudentPricing: all.filter((p) => p.memberType === 'NON_STUDENT'),
            isLoading:  query.isLoading,
            isError:    query.isError,
            error:      query.error ?? null,
            refetch:    query.refetch,
        };
    }, [query.data, query.error, query.isError, query.isLoading, query.refetch]);

    return (
        <RentalPricingContext.Provider value={value}>
            {children}
        </RentalPricingContext.Provider>
    );
}
