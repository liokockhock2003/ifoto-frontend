import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKpiStats } from '@/store/queries/report';

export function KpiCards() {
    const { data, isLoading } = useKpiStats();

    const overdueCount = data?.overdueCount ?? 0;

    const cards = [
        {
            title: 'Total Rentals This Month',
            value: data?.totalRentalsThisMonth ?? 0,
            icon: TrendingUp,
            display: (v: number) => v.toString(),
            danger: false,
        },
        {
            title: 'Total Revenue Collected',
            value: data?.totalRevenueCollected ?? 0,
            icon: DollarSign,
            display: (v: number) => `RM ${v.toFixed(2)}`,
            danger: false,
        },
        {
            title: 'Active Rentals',
            value: data?.activeRentals ?? 0,
            icon: Package,
            display: (v: number) => v.toString(),
            danger: false,
        },
        {
            title: 'Overdue Rentals',
            value: overdueCount,
            icon: AlertTriangle,
            display: (v: number) => v.toString(),
            danger: overdueCount > 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                        <card.icon
                            className={`h-4 w-4 ${card.danger ? 'text-destructive' : 'text-muted-foreground'}`}
                        />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                        ) : (
                            <div className={`text-2xl font-bold ${card.danger ? 'text-destructive' : ''}`}>
                                {card.display(card.value)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
