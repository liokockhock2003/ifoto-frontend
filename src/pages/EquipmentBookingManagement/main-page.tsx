import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, ChevronDown, Search } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useBookingManagementContext } from './context';
import { BookingManagementProvider } from './provider';
import { bookingManagementColumns } from './table-column-def';

// ── Constants ─────────────────────────────────────────────────────────────────

const RENTAL_STATUSES = [
    'PENDING_REVIEW',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'PENDING_PAYMENT',
    // 'PENDING_CASH',
    'PAID',
    'ACTIVE',
    'OVERDUE',
    'RETURNED',
] as const;

// ── Header controls ───────────────────────────────────────────────────────────

function SearchInput() {
    const { filters, setSearch } = useBookingManagementContext();
    const [value, setValue] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setValue(next);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(next || undefined);
        }, 300);
    };

    useEffect(() => {
        setValue(filters.search ?? '');
    }, [filters.search]);

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search rentals..."
                value={value}
                onChange={handleChange}
                className="w-full pl-9 sm:w-52 rounded-4xl"
            />
        </div>
    );
}

function StatusFilter() {
    const { filters, setStatus } = useBookingManagementContext();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-4xl gap-1.5 text-muted-foreground">
                    {filters.status ? filters.status.replace(/_/g, ' ') : 'All statuses'}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup
                    value={filters.status ?? ''}
                    onValueChange={(val) => setStatus(val || undefined)}
                >
                    <DropdownMenuRadioItem value="">All statuses</DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {RENTAL_STATUSES.map((s) => (
                        <DropdownMenuRadioItem key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                {filters.status && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="justify-center text-muted-foreground"
                            onSelect={() => setStatus(undefined)}
                        >
                            Clear filter
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// ── Page content ──────────────────────────────────────────────────────────────

function BookingManagementContent() {
    const {
        rentals,
        filters,
        totalElements,
        totalPages,
        isLoading,
        isError,
        error,
        setPage,
        refetch,
    } = useBookingManagementContext();

    return (
        <div className="space-y-4 p-2 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl text-primary font-semibold tracking-tight">Equipment Booking Management</h1>
                    <p className="text-sm text-muted-foreground">Review and manage all rental requests.</p>
                </div>
            </div>

            <DataTable
                columns={bookingManagementColumns}
                data={rentals}
                isLoading={isLoading}
                isError={isError}
                error={error ?? undefined}
                onRetry={() => void refetch()}
                title="All Rental Requests"
                totalElements={totalElements}
                headerActions={
                    <div className="flex items-center gap-2">
                        <SearchInput />
                        <StatusFilter />
                    </div>
                }
                page={filters.page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyMessage="No rentals found."
            />
        </div>
    );
}

// ── Default export ────────────────────────────────────────────────────────────

export default function BookingManagementMainPage() {
    return (
        <BookingManagementProvider>
            <BookingManagementContent />
        </BookingManagementProvider>
    );
}
