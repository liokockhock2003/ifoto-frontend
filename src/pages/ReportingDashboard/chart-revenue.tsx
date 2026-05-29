import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { useRevenueOverTime } from '@/store/queries/report';
import { useReportingDashboardContext } from './context';
import { formatMonth } from './utils';

const chartConfig: ChartConfig = {
    baseAmount: { label: 'Base Revenue', color: 'var(--color-primary)' },
    penaltyAmount: { label: 'Penalty Revenue', color: 'var(--color-destructive)' },
};

export function ChartRevenue() {
    const { months } = useReportingDashboardContext();
    const { data = [], isLoading } = useRevenueOverTime(months);

    const chartData = data.map((item) => ({
        ...item,
        month: formatMonth(item.month),
    }));

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Revenue Over Time (RM)</CardTitle>
                <CardDescription>Base vs penalty revenue collected per month</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="aspect-video w-full animate-pulse rounded bg-muted" />
                ) : (
                    <ChartContainer config={chartConfig} className="max-h-[270px] w-full">
                        <LineChart data={chartData} margin={{ left: -10, right: 4 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 11 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) => `${v}`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Line
                                type="monotone"
                                dataKey="baseAmount"
                                stroke="var(--color-baseAmount)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="penaltyAmount"
                                stroke="var(--color-penaltyAmount)"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
