import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, CalendarRange, ChevronDown, Search } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';

import type { RentalStatus } from '@/constants/rentalStatus';
import type { Rental } from '@/store/schemas/rental';
import { useBookingManagementContext } from './context';
import { BookingManagementProvider } from './provider';
import { bookingManagementColumns } from './table-column-def';

// Tabs are driven by rental status.
const STATUS_TABS: { value: RentalStatus; label: string }[] = [
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAID', label: 'Paid' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'RETURNED', label: 'Returned' },
];

type ApprovedScope = 'all' | 'mine';
type ReturnedVariant = 'all' | 'none' | 'unpaid' | 'paid';

const RETURNED_VARIANT_OPTIONS: { value: ReturnedVariant; label: string }[] = [
    { value: 'all', label: 'All returned' },
    { value: 'none', label: 'No overdue' },
    { value: 'unpaid', label: 'Unpaid overdue' },
    { value: 'paid', label: 'Paid overdue' },
];

// A returned rental's overdue settlement state, derived from its late-penalty + payment status.
function returnedVariantOf(r: Rental): Exclude<ReturnedVariant, 'all'> {
    if (r.totalPenaltyAmount <= 0) return 'none';
    return r.paymentStatus === 'PENALTY_PAID' ? 'paid' : 'unpaid';
}

// ── Shared controls ───────────────────────────────────────────────────────────

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search rentals..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 sm:w-52 rounded-4xl"
            />
        </div>
    );
}

function RadioFilter<T extends string>({
    value,
    onChange,
    options,
}: {
    value: T;
    onChange: (v: T) => void;
    options: { value: T; label: string }[];
}) {
    const current = options.find((o) => o.value === value);
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 rounded-4xl gap-1.5 text-muted-foreground">
                    {current?.label}
                    <ChevronDown className="h-3.5 w-3.5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as T)}>
                    {options.map((o) => (
                        <DropdownMenuRadioItem key={o.value} value={o.value}>{o.label}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function RentalTable({
    data,
    title,
    headerActions,
    emptyMessage,
}: {
    data: Rental[];
    title: string;
    headerActions: React.ReactNode;
    emptyMessage: string;
}) {
    const { isLoading, isError, error, refetch } = useBookingManagementContext();
    return (
        <DataTable
            columns={bookingManagementColumns}
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error ?? undefined}
            onRetry={() => void refetch()}
            title={title}
            totalElements={data.length}
            headerActions={headerActions}
            emptyMessage={emptyMessage}
        />
    );
}

// ── Page content ──────────────────────────────────────────────────────────────

function BookingManagementContent() {
    const { allRentals, currentUsername } = useBookingManagementContext();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [approvedScope, setApprovedScope] = useState<ApprovedScope>('all');
    const [returnedVariant, setReturnedVariant] = useState<ReturnedVariant>('all');

    const q = search.trim().toLowerCase();
    const matchesSearch = (r: Rental) =>
        !q ||
        r.rentalNumber.toLowerCase().includes(q) ||
        r.renterUsername.toLowerCase().includes(q);

    // The approving committee owns a rental from approval to finish, so the page-level
    // "approved by me" switch scopes every status — except Pending Review, which has no
    // reviewer yet and must always show the full queue.
    const inScope = (s: RentalStatus, r: Rental) =>
        s === 'PENDING_REVIEW' || approvedScope === 'all' || r.reviewedByUsername === currentUsername;

    const countByStatus = (s: RentalStatus) =>
        allRentals.filter((r) => r.status === s && inScope(s, r)).length;

    const listFor = (s: RentalStatus) =>
        allRentals.filter((r) => r.status === s && inScope(s, r) && matchesSearch(r));

    const returned = listFor('RETURNED').filter(
        (r) => returnedVariant === 'all' || returnedVariantOf(r) === returnedVariant,
    );

    const searchOnly = <SearchInput value={search} onChange={setSearch} />;

    return (
        <div className="space-y-4 p-2 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">Rental Management</h1>
                        <p className="text-sm text-muted-foreground">Review and manage all rental requests.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => navigate('/rental-management/calendar')}
                >
                    <CalendarRange className="h-4 w-4" />
                    <span className="hidden sm:inline">Calendar Mode</span>
                </Button>
            </div>

            <Tabs defaultValue="PENDING_REVIEW">
                <div className="flex items-center justify-between gap-4">
                    <PrimaryTabsList>
                        {STATUS_TABS.map((t) => (
                            <PrimaryTabsTrigger key={t.value} value={t.value}>
                                {t.label} ({countByStatus(t.value)})
                            </PrimaryTabsTrigger>
                        ))}
                    </PrimaryTabsList>
                    <div className="flex items-center gap-2">
                        <Switch
                            id="approver-scope"
                            checked={approvedScope === 'mine'}
                            onCheckedChange={(c) => setApprovedScope(c ? 'mine' : 'all')}
                        />
                        <Label htmlFor="approver-scope" className="text-sm text-muted-foreground whitespace-nowrap">
                            Approved by me
                        </Label>
                    </div>
                </div>

                <TabsContent value="PENDING_REVIEW">
                    <RentalTable
                        data={listFor('PENDING_REVIEW')}
                        title="Pending Review"
                        headerActions={searchOnly}
                        emptyMessage="No rentals pending review."
                    />
                </TabsContent>

                <TabsContent value="APPROVED">
                    <RentalTable
                        data={listFor('APPROVED')}
                        title="Approved Rentals"
                        headerActions={searchOnly}
                        emptyMessage="No approved rentals."
                    />
                </TabsContent>

                <TabsContent value="PICKED_UP">
                    <RentalTable
                        data={listFor('PICKED_UP')}
                        title="Picked Up"
                        headerActions={searchOnly}
                        emptyMessage="No picked-up rentals."
                    />
                </TabsContent>

                <TabsContent value="ACTIVE">
                    <RentalTable
                        data={listFor('ACTIVE')}
                        title="Active"
                        headerActions={searchOnly}
                        emptyMessage="No active rentals."
                    />
                </TabsContent>

                <TabsContent value="PAID">
                    <RentalTable
                        data={listFor('PAID')}
                        title="Paid"
                        headerActions={searchOnly}
                        emptyMessage="No paid rentals."
                    />
                </TabsContent>

                <TabsContent value="OVERDUE">
                    <RentalTable
                        data={listFor('OVERDUE')}
                        title="Overdue"
                        headerActions={searchOnly}
                        emptyMessage="No overdue rentals."
                    />
                </TabsContent>

                <TabsContent value="RETURNED">
                    <RentalTable
                        data={returned}
                        title="Returned"
                        headerActions={
                            <div className="flex items-center gap-2">
                                <SearchInput value={search} onChange={setSearch} />
                                <RadioFilter
                                    value={returnedVariant}
                                    onChange={setReturnedVariant}
                                    options={RETURNED_VARIANT_OPTIONS}
                                />
                            </div>
                        }
                        emptyMessage="No returned rentals."
                    />
                </TabsContent>
            </Tabs>
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
