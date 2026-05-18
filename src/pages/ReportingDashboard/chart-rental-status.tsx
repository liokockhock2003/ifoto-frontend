import { Cell, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { useRentalStatusBreakdown } from '@/store/queries/report';

const STATUS_COLORS: Record<string, string> = {
    PENDING_REVIEW: '#f59e0b',
    APPROVED: '#3b82f6',
    ACTIVE: '#22c55e',
    OVERDUE: '#ef4444',
    RETURNED: '#8b5cf6',
    REJECTED: '#6b7280',
    CANCELLED: '#94a3b8',
};

const STATUS_LABELS: Record<string, string> = {
    PENDING_REVIEW: 'Pending Review',
    APPROVED: 'Approved',
    ACTIVE: 'Active',
    OVERDUE: 'Overdue',
    RETURNED: 'Returned',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
};

export function ChartRentalStatus() {
    const { data = [], isLoading } = useRentalStatusBreakdown();

    const chartConfig: ChartConfig = Object.fromEntries(
        data.map((item) => [
            item.status,
            {
                label: STATUS_LABELS[item.status] ?? item.status,
                color: STATUS_COLORS[item.status] ?? '#94a3b8',
            },
        ]),
    );

    const total = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Rental Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex aspect-square max-h-[280px] items-center justify-center mx-auto">
                        <div className="h-32 w-32 animate-pulse rounded-full bg-muted" />
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[280px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="status"
                                innerRadius={65}
                                outerRadius={100}
                            >
                                {data.map((entry) => (
                                    <Cell
                                        key={entry.status}
                                        fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                )}
                <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {data.map((item) => (
                        <div key={item.status} className="flex items-center gap-1.5 text-xs">
                            <div
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{ backgroundColor: STATUS_COLORS[item.status] ?? '#94a3b8' }}
                            />
                            <span className="text-muted-foreground">
                                {STATUS_LABELS[item.status] ?? item.status}
                            </span>
                            <span className="font-medium tabular-nums">{item.count}</span>
                        </div>
                    ))}
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">{total} total rentals</p>
            </CardContent>
        </Card>
    );
}
