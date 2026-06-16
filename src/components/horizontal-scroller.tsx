import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Wraps content in a horizontally-scrollable area. Owns only the *behavior*:
 * it detects scroll position and positions/reveals the edge indicators the
 * consumer supplies via `leftIndicator` / `rightIndicator`. The consumer fully
 * controls how those indicators look (see the default `ScrollChevron` below).
 */
export function HorizontalScroller({
    children,
    className,
    contentClassName,
    leftIndicator,
    rightIndicator,
}: {
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    leftIndicator?: ReactNode;
    rightIndicator?: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [canLeft, setCanLeft] = useState(false);
    const [canRight, setCanRight] = useState(false);

    const update = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        setCanLeft(scrollLeft > 1);
        setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
    }, []);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        update();
        el.addEventListener('scroll', update, { passive: true });
        const ro = new ResizeObserver(update);
        ro.observe(el);
        if (el.firstElementChild) ro.observe(el.firstElementChild);
        return () => {
            el.removeEventListener('scroll', update);
            ro.disconnect();
        };
    }, [update]);

    return (
        <div className={cn('relative', className)}>
            <div
                ref={ref}
                className={cn('overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden', contentClassName)}
            >
                {children}
            </div>

            {leftIndicator && (
                <div
                    className={cn(
                        'pointer-events-none absolute inset-y-0 left-0 transition-opacity',
                        canLeft ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    {leftIndicator}
                </div>
            )}
            {rightIndicator && (
                <div
                    className={cn(
                        'pointer-events-none absolute inset-y-0 right-0 transition-opacity',
                        canRight ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    {rightIndicator}
                </div>
            )}
        </div>
    );
}

/**
 * Default edge indicator: a fade + chevron. Consumers can restyle it via
 * `className` or pass an entirely custom node to HorizontalScroller instead.
 */
export function ScrollChevron({ side, className }: { side: 'left' | 'right'; className?: string }) {
    const Icon = side === 'left' ? ChevronLeft : ChevronRight;
    return (
        <div
            className={cn(
                // Fade colour (`from-*`) and arrow colour (`text-*`) default to the app theme
                // but can be overridden via className (the icon inherits `currentColor`).
                'flex h-full items-center from-background to-transparent text-foreground/70',
                side === 'left' ? 'pl-1 pr-4 bg-linear-to-r' : 'justify-end pl-4 pr-1 bg-linear-to-l',
                className,
            )}
        >
            <Icon className="size-6" />
        </div>
    );
}
