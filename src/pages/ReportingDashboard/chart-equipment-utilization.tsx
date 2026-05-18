import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { useEquipmentUtilization } from '@/store/queries/report';

const chartConfig: ChartConfig = {
    rentalCount: {
        label: 'Rentals',
        color: '#3b82f6',
    },
};

const MAX_ITEMS = 10;

export function ChartEquipmentUtilization() {
    const { data = [], isLoading } = useEquipmentUtilization();

    const chartData = data.slice(0, MAX_ITEMS).map((item) => ({
        name: item.equipmentName,
        rentalCount: item.rentalCount,
        category: item.category,
    }));

    const chartHeight = Math.max(240, chartData.length * 44);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Equipment Utilization (Top {MAX_ITEMS})</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-64 w-full animate-pulse rounded bg-muted" />
                ) : (
                    <div style={{ height: chartHeight }}>
                        <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ left: 0, right: 24, top: 4, bottom: 4 }}
                            >
                                <CartesianGrid horizontal={false} />
                                <XAxis
                                    type="number"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    allowDecimals={false}
                                    tick={{ fontSize: 11 }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    width={160}
                                    tick={{ fontSize: 11 }}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="rentalCount"
                                    fill="var(--color-rentalCount)"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
