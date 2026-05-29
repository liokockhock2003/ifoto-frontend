import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        color: 'var(--color-primary)',
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

    const chartHeight = Math.max(160, chartData.length * 28);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Equipment Utilization</CardTitle>
                <CardDescription>Top {MAX_ITEMS} most rented items</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-56 w-full animate-pulse rounded bg-muted" />
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
                                    width={155}
                                    tick={{ fontSize: 10 }}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar
                                    dataKey="rentalCount"
                                    fill="var(--color-rentalCount)"
                                    radius={[0, 4, 4, 0]}
                                    barSize={16}
                                />
                            </BarChart>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
