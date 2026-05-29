import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { useRentalVolume } from '@/store/queries/report';
import { useReportingDashboardContext } from './context';
import { formatMonth } from './utils';

const chartConfig: ChartConfig = {
    count: {
        label: 'Rentals',
        color: 'var(--color-primary)',
    },
};

export function ChartRentalVolume() {
    const { months } = useReportingDashboardContext();
    const { data = [], isLoading } = useRentalVolume(months);

    const chartData = data.map((item) => ({
        ...item,
        month: formatMonth(item.month),
    }));

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Rental Volume Over Time</CardTitle>
                <CardDescription>Number of rentals per month</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="aspect-video w-full animate-pulse rounded bg-muted" />
                ) : (
                    <ChartContainer config={chartConfig} className="max-h-[280px] w-full">
                        <BarChart data={chartData} margin={{ left: -10, right: 4 }}>
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
                                allowDecimals={false}
                                tick={{ fontSize: 11 }}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
