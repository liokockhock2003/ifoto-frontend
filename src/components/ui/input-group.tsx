import * as React from 'react';
import { cn } from '@/lib/utils';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex h-9 w-full items-stretch overflow-hidden rounded-md border border-input bg-transparent text-sm shadow-xs focus-within:ring-1 focus-within:ring-ring',
                className,
            )}
            {...props}
        />
    );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            className={cn(
                'min-w-0 flex-1 bg-transparent px-3 py-1 text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
}

function InputGroupAddon({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={cn(
                'flex items-center justify-center border-l border-input bg-muted px-2.5 text-muted-foreground [&_svg]:size-4',
                className,
            )}
            {...props}
        />
    );
}

export { InputGroup, InputGroupInput, InputGroupAddon };
