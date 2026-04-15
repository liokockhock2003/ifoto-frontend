import * as React from 'react';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
    value: string;           // YYYY-MM-DD
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
};

export function DatePicker({
    value,
    onChange,
    placeholder = 'Pick a date',
    disabled,
    className,
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    const selected = React.useMemo(() => {
        if (!value) return undefined;
        const date = parse(value, 'yyyy-MM-dd', new Date());
        return isValid(date) ? date : undefined;
    }, [value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                        'w-full justify-start text-left font-normal',
                        !selected && 'text-muted-foreground',
                        className,
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    {selected ? format(selected, 'PPP') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-none" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(date) => {
                        onChange(date ? format(date, 'yyyy-MM-dd') : '');
                        setOpen(false);
                    }}
                    className="border rounded-2xl w-54"
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
