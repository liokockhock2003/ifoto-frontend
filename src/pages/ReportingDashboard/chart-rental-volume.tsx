import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { useRentalVolume } from '@/store/queries/report';
import { useReportingDashboardContext } from './context';

const chartConfig: ChartConfig = {
    count: {
        label: 'Rentals',
        color: '#3b82f6',
    },
};

function formatMonth(yyyyMm: string): string {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
}

export function ChartRentalVolume() {
    const { months } = useReportingDashboardContext();
    const { data = [], isLoading } = useRentalVolume(months);

    const chartData = data.map((item) => ({
        ...item,
        month: formatMonth(item.month),
    }));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Rental Volume Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="aspect-video w-full animate-pulse rounded bg-muted" />
                ) : (
                    <ChartContainer config={chartConfig}>
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
