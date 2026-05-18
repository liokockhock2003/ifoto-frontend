import { createContext, useContext } from 'react';

export type ReportingDashboardContextValue = {
    months: number;
    setMonths: (n: number) => void;
};

export const ReportingDashboardContext = createContext<ReportingDashboardContextValue | undefined>(undefined);

export function useReportingDashboardContext(): ReportingDashboardContextValue {
    const ctx = useContext(ReportingDashboardContext);
    if (!ctx) throw new Error('useReportingDashboardContext must be used within <ReportingDashboardProvider>');
    return ctx;
}
