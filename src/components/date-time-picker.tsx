import * as React from 'react';
import { parseISO, isValid, format, startOfDay, endOfDay } from 'date-fns';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import { alpha } from '@mui/material/styles';

type DateTimePickerProps = {
    value: string;           // YYYY-MM-DDTHH:mm  or  YYYY-MM-DDTHH:mm:ss (both accepted)
    onChange: (value: string) => void; // always emits YYYY-MM-DDTHH:mm
    placeholder?: string;
    disabled?: boolean;
    minDate?: string;        // YYYY-MM-DD or YYYY-MM-DDTHH:mm — disables calendar dates before this
    maxDate?: string;        // YYYY-MM-DD or YYYY-MM-DDTHH:mm — disables calendar dates after this
    periodStart?: string;    // YYYY-MM-DD or YYYY-MM-DDTHH:mm — start of highlighted period range
    periodEnd?: string;      // YYYY-MM-DD or YYYY-MM-DDTHH:mm — end of highlighted period range
    className?: string;
};

const EMIT = "yyyy-MM-dd'T'HH:mm";

function toDate(s?: string): Date | null {
    if (!s) return null;
    const d = parseISO(s);
    return isValid(d) ? d : null;
}

export function DateTimePicker({
    value,
    onChange,
    disabled,
    minDate,
    maxDate,
    periodStart,
    periodEnd,
    className,
}: DateTimePickerProps) {
    const periodFrom = React.useMemo(() => {
        const d = toDate(periodStart);
        return d ? startOfDay(d) : null;
    }, [periodStart]);
    const periodTo = React.useMemo(() => {
        const d = toDate(periodEnd);
        return d ? endOfDay(d) : null;
    }, [periodEnd]);

    const Day = React.useCallback(
        (props: PickerDayProps) => {
            const day = props.day as Date;
            const inPeriod = !!periodFrom && !!periodTo && day >= periodFrom && day <= periodTo;
            return (
                <PickerDay
                    {...props}
                    sx={
                        inPeriod
                            ? { backgroundColor: (t) => alpha(t.palette.primary.main, 0.25) }
                            : undefined
                    }
                />
            );
        },
        [periodFrom, periodTo],
    );

    return (
        <MuiDateTimePicker
            label="Select date and time"
            value={toDate(value)}
            onChange={(d) => {
                if (d && isValid(d)) onChange(format(d, EMIT));
            }}
            disabled={disabled}
            minDate={toDate(minDate) ?? undefined}
            maxDate={toDate(maxDate) ?? undefined}
            ampm
            format="MMM d, yyyy  hh:mm a"
            views={['year', 'month', 'day', 'hours', 'minutes']}
            viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
            }}
            slots={{ day: Day }}
            slotProps={{
                textField: {
                    size: 'small',
                    fullWidth: true,
                    className,
                    sx: {
                        '& .MuiPickersInputBase-root, & .MuiInputBase-root': { fontSize: '0.75rem' },
                        '& .MuiInputLabel-root': { fontSize: '0.75rem' },
                        color: 'var(--muted-foreground)'
                    },
                },
                openPickerIcon: {
                    sx: { fontSize: '1rem', color: 'var(--muted-foreground)' },
                },
                // The picker popup is portalled to <body>, which Radix Dialog sets to
                // `pointer-events: none` while open — re-enable it on the popup subtree
                // so the calendar/toolbar are clickable, not just the clock.
                popper: {
                    sx: { pointerEvents: 'auto' },
                },
            }}
        />
    );
}
