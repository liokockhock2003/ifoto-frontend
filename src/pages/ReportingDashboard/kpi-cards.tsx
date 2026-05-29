import { AlertTriangle, DollarSign, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="p-4">
                    <CardContent className="p-0">
                        <div className="flex items-start gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                card.danger ? 'bg-destructive/10' : 'bg-primary/10'
                            }`}>
                                <card.icon className={`h-4 w-4 ${card.danger ? 'text-destructive' : 'text-primary'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-muted-foreground leading-tight">{card.title}</p>
                                {isLoading ? (
                                    <div className="mt-1 h-6 w-20 animate-pulse rounded bg-muted" />
                                ) : (
                                    <p className={`mt-0.5 text-xl font-bold tabular-nums ${card.danger ? 'text-destructive' : ''}`}>
                                        {card.display(card.value)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
