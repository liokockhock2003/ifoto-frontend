import type { ReactNode } from 'react';
import { useMyOwnRentals } from '@/store/queries/rental';
import { RentalListContext } from './context';

export function RentalListProvider({ children }: { children: ReactNode }) {
    const { data, isLoading, isError, error, refetch } = useMyOwnRentals();

    return (
        <RentalListContext.Provider value={{ data, isLoading, isError, error, refetch }}>
            {children}
        </RentalListContext.Provider>
    );
}
