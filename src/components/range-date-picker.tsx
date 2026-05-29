import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type RangeDatePickerProps = {
    startDate: string;           // YYYY-MM-DD
    endDate: string;             // YYYY-MM-DD
    onStartChange: (value: string) => void;
    onEndChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

function parseDate(value: string): Date | undefined {
    if (!value) return undefined;
    const d = parse(value, 'yyyy-MM-dd', new Date());
    return isValid(d) ? d : undefined;
}

export function RangeDatePicker({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    placeholder = 'Pick a date range',
    disabled,
    className,
}: RangeDatePickerProps) {
    const [open, setOpen] = React.useState(false);

    const from = parseDate(startDate);
    const to = parseDate(endDate);

    const handleSelect = (range: DateRange | undefined) => {
        onStartChange(range?.from ? format(range.from, 'yyyy-MM-dd') : '');
        onEndChange(range?.to ? format(range.to, 'yyyy-MM-dd') : '');
    };

    const label = from
        ? to
            ? `${format(from, 'PPP')} – ${format(to, 'PPP')}`
            : `${format(from, 'PPP')} – ...`
        : placeholder;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !from && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {label}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-none" align="start">
                <Calendar
                    mode="range"
                    selected={{ from, to }}
                    onSelect={handleSelect}
                    className="border rounded-2xl w-48 sm:w-94"
                    numberOfMonths={2}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
