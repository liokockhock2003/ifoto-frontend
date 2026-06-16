import { cn } from '@/lib/utils';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HorizontalScroller, ScrollChevron } from '@/components/horizontal-scroller';

function PrimaryTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
    return (
        // min-w-0 lets the scroller shrink within a flex row (e.g. next to the "Approved by me"
        // switch) so it scrolls instead of pushing siblings off-screen.
        <HorizontalScroller
            className="min-w-0 max-w-full"
            leftIndicator={<ScrollChevron side="left" />}
            rightIndicator={<ScrollChevron side="right" />}
        >
            <TabsList
                className={cn(
                    'bg-primary/10 border border-primary/20 h-auto gap-1',
                    // Mobile: single row that scrolls (the scroller shows chevron indicators).
                    'flex-nowrap justify-start',
                    // Desktop: wrap to fit — content stays within width, so no scroll/indicators.
                    'sm:flex-wrap sm:justify-center',
                    className,
                )}
                {...props}
            />
        </HorizontalScroller>
    );
}

function PrimaryTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
    return (
        <TabsTrigger
            className={cn(
                // shrink-0 so triggers keep their width and scroll/wrap rather than squashing.
                'shrink-0 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
                className,
            )}
            {...props}
        />
    );
}

export { PrimaryTabsList, PrimaryTabsTrigger };
