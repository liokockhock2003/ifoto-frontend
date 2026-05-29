import { BarChart3 } from 'lucide-react';
import { ReportingDashboardProvider } from './provider';
import { useReportingDashboardContext } from './context';
import { KpiCards } from './kpi-cards';
import { ChartRentalStatus } from './chart-rental-status';
import { ChartRentalVolume } from './chart-rental-volume';
import { ChartRevenue } from './chart-revenue';
import { ChartEquipmentUtilization } from './chart-equipment-utilization';

const MONTH_OPTIONS = [6, 12] as const;

function DashboardContent() {
    const { months, setMonths } = useReportingDashboardContext();

    return (
        <div className="space-y-4 p-2 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">Reporting Dashboard</h1>
                        <p className="text-sm text-muted-foreground">Equipment rental analytics and performance metrics</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg border p-1">
                    {MONTH_OPTIONS.map((m) => (
                        <button
                            key={m}
                            onClick={() => setMonths(m)}
                            className={`rounded px-3 py-1 text-xs font-medium transition-colors ${months === m
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {m}M
                        </button>
                    ))}
                </div>
            </div>

            <KpiCards />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ChartRentalStatus />
                <div className="lg:col-span-2">
                    <ChartRentalVolume />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ChartRevenue />
                <ChartEquipmentUtilization />
            </div>
        </div>
    );
}

export default function ReportingDashboardMainPage() {
    return (
        <ReportingDashboardProvider>
            <DashboardContent />
        </ReportingDashboardProvider>
    );
}
