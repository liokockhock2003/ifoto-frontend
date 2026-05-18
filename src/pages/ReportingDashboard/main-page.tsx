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
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BarChart3 className="h-7 w-7 text-primary" />
                    <div>
                        <h1 className="text-2xl font-semibold">Reporting Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            Equipment rental analytics and performance metrics
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 rounded-md border p-1">
                    {MONTH_OPTIONS.map((m) => (
                        <button
                            key={m}
                            onClick={() => setMonths(m)}
                            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                                months === m
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

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <ChartRentalStatus />
                <div className="lg:col-span-2">
                    <ChartRentalVolume />
                </div>
            </div>

            <ChartRevenue />

            <ChartEquipmentUtilization />
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
