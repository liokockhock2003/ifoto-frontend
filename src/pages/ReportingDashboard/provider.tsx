import { useMemo, useState, type ReactNode } from 'react';
import { ReportingDashboardContext } from './context';

export function ReportingDashboardProvider({ children }: { children: ReactNode }) {
    const [months, setMonths] = useState(12);

    const value = useMemo(() => ({ months, setMonths }), [months]);

    return (
        <ReportingDashboardContext.Provider value={value}>
            {children}
        </ReportingDashboardContext.Provider>
    );
}
