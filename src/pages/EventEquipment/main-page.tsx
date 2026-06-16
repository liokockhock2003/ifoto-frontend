import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarRange, ClipboardList, Search } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';

import type { RequestStatus } from '@/constants/requestStatus';
import type { EquipmentRequest } from '@/store/schemas/request';
import { useRequestManagementContext } from './context';
import { RequestManagementProvider } from './provider';
import { requestManagementColumns } from './table-column-def';

// Tabs are driven by request status.
const STATUS_TABS: { value: RequestStatus; label: string }[] = [
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'RETURNED', label: 'Returned' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
];

type ApprovedScope = 'all' | 'mine';

// ── Shared controls ───────────────────────────────────────────────────────────

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search requests..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full pl-9 sm:w-52 rounded-4xl"
            />
        </div>
    );
}

function RequestTable({
    data,
    title,
    headerActions,
    emptyMessage,
}: {
    data: EquipmentRequest[];
    title: string;
    headerActions: React.ReactNode;
    emptyMessage: string;
}) {
    const { isLoading, isError, error, refetch } = useRequestManagementContext();
    return (
        <DataTable
            columns={requestManagementColumns}
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

function RequestManagementContent() {
    const { allRequests, currentUsername } = useRequestManagementContext();
    const navigate = useNavigate();

    const [search, setSearch] = useState('');
    const [approvedScope, setApprovedScope] = useState<ApprovedScope>('all');

    const q = search.trim().toLowerCase();
    const matchesSearch = (r: EquipmentRequest) =>
        !q ||
        r.requestNumber.toLowerCase().includes(q) ||
        r.eventName.toLowerCase().includes(q) ||
        r.requestedByUsername.toLowerCase().includes(q);

    // The approving committee owns a request from approval to finish, so the page-level
    // "approved by me" switch scopes every status — except Pending Review, which has no
    // reviewer yet and must always show the full queue.
    const inScope = (s: RequestStatus, r: EquipmentRequest) =>
        s === 'PENDING_REVIEW' || approvedScope === 'all' || r.reviewedByUsername === currentUsername;

    const countByStatus = (s: RequestStatus) =>
        allRequests.filter((r) => r.status === s && inScope(s, r)).length;

    const listFor = (s: RequestStatus) =>
        allRequests.filter((r) => r.status === s && inScope(s, r) && matchesSearch(r));

    const searchOnly = <SearchInput value={search} onChange={setSearch} />;

    return (
        <div className="space-y-4 p-2 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">Event's Equipment</h1>
                        <p className="text-sm text-muted-foreground">Review and action equipment requests from event committees.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => navigate('/event-equipment/calendar')}
                >
                    <CalendarRange className="h-4 w-4" />
                    <span className="hidden sm:inline">Calendar Mode</span>
                </Button>
            </div>

            <Tabs defaultValue="PENDING_REVIEW">
                <div className="flex flex-col items-end justify-between gap-2 sm:flex-row sm:items-center">
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
                    <RequestTable
                        data={listFor('PENDING_REVIEW')}
                        title="Pending Review"
                        headerActions={searchOnly}
                        emptyMessage="No requests pending review."
                    />
                </TabsContent>

                <TabsContent value="APPROVED">
                    <RequestTable
                        data={listFor('APPROVED')}
                        title="Approved Requests"
                        headerActions={searchOnly}
                        emptyMessage="No approved requests."
                    />
                </TabsContent>

                <TabsContent value="PICKED_UP">
                    <RequestTable
                        data={listFor('PICKED_UP')}
                        title="Picked Up"
                        headerActions={searchOnly}
                        emptyMessage="No picked-up requests."
                    />
                </TabsContent>

                <TabsContent value="ACTIVE">
                    <RequestTable
                        data={listFor('ACTIVE')}
                        title="Active"
                        headerActions={searchOnly}
                        emptyMessage="No active requests."
                    />
                </TabsContent>

                <TabsContent value="RETURNED">
                    <RequestTable
                        data={listFor('RETURNED')}
                        title="Returned"
                        headerActions={searchOnly}
                        emptyMessage="No returned requests."
                    />
                </TabsContent>

                <TabsContent value="REJECTED">
                    <RequestTable
                        data={listFor('REJECTED')}
                        title="Rejected"
                        headerActions={searchOnly}
                        emptyMessage="No rejected requests."
                    />
                </TabsContent>

                <TabsContent value="CANCELLED">
                    <RequestTable
                        data={listFor('CANCELLED')}
                        title="Cancelled"
                        headerActions={searchOnly}
                        emptyMessage="No cancelled requests."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// ── Default export ────────────────────────────────────────────────────────────

export default function RequestManagementMainPage() {
    return (
        <RequestManagementProvider>
            <RequestManagementContent />
        </RequestManagementProvider>
    );
}
