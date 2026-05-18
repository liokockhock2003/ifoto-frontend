import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ReportingDashboardContext } from './context';

export function ReportingDashboardProvider({ children }: { children: ReactNode }) {
    const [months, setMonthsState] = useState(12);

    const setMonths = useCallback((n: number) => {
        setMonthsState(n);
    }, []);

    const value = useMemo(() => ({ months, setMonths }), [months, setMonths]);

    return (
        <ReportingDashboardContext.Provider value={value}>
            {children}
        </ReportingDashboardContext.Provider>
    );
}
