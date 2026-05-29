import { cn } from '@/lib/utils';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

function PrimaryTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
    return (
        <TabsList
            className={cn('bg-primary/10 border border-primary/20 flex-wrap h-auto gap-1', className)}
            {...props}
        />
    );
}

function PrimaryTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
    return (
        <TabsTrigger
            className={cn(
                'font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
                className,
            )}
            {...props}
        />
    );
}

export { PrimaryTabsList, PrimaryTabsTrigger };
