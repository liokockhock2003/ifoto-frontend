import { Cell, Pie, PieChart } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useRentalStatusBreakdown } from '@/store/queries/report';
import type { RentalStatusBreakdown } from '@/store/schemas/report';

const BREAKDOWN_CONFIG = [
    { key: 'approved', label: 'Approved', color: 'var(--color-primary)' },
    { key: 'paid', label: 'Paid', color: 'var(--color-chart-4)' },
    { key: 'active', label: 'Active', color: '#22c55e' },
    { key: 'overdue', label: 'Overdue', color: 'var(--color-destructive)' },
    { key: 'paidOverdue', label: 'Paid (Overdue)', color: '#f97316' },
    { key: 'returned', label: 'Returned', color: '#8b5cf6' },
] as const satisfies { key: keyof RentalStatusBreakdown; label: string; color: string }[];

const chartConfig: ChartConfig = Object.fromEntries(
    BREAKDOWN_CONFIG.map(({ key, label, color }) => [key, { label, color }]),
);

export function ChartRentalStatus() {
    const { data, isLoading } = useRentalStatusBreakdown();

    const chartData = data
        ? BREAKDOWN_CONFIG.map(({ key, label, color }) => ({
            name: key, label, count: data[key], color,
        }))
        : [];

    const total = chartData.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Rental Status Breakdown</CardTitle>
                <CardDescription>Distribution across all rental states</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex aspect-square max-h-[240px] items-center justify-center mx-auto">
                        <div className="h-28 w-28 animate-pulse rounded-full bg-muted" />
                    </div>
                ) : total === 0 ? (
                    <Empty className="py-6">
                        <EmptyHeader>
                            <EmptyMedia variant="icon"><PieChartIcon /></EmptyMedia>
                            <EmptyTitle className="text-sm">No rental data</EmptyTitle>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <>
                        <ChartContainer config={chartConfig} className="max-h-[200px] mx-auto aspect-square">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie
                                    data={chartData}
                                    dataKey="count"
                                    nameKey="name"
                                    innerRadius={35}
                                    outerRadius={90}
                                >
                                    {chartData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                        <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                            {chartData.map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                    <div
                                        className="h-2 w-2 shrink-0 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-muted-foreground">{item.label}</span>
                                    <span className="font-semibold tabular-nums">{item.count}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-center text-xs text-muted-foreground">{total} total rentals</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
