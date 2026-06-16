import { ClipboardList, Plus, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';

import { useEquipmentRequestListContext } from './context';
import { EquipmentRequestListProvider } from './provider';
import { requestColumns } from './table-column-def';

function EquipmentRequestListContent() {
    const { requests, eventId, isLoading, isError, error, refetch } =
        useEquipmentRequestListContext();

    const navigate = useNavigate();
    const { state } = useLocation();
    const eventName =
        (state as { breadcrumbLabel?: string } | null)?.breadcrumbLabel ??
        requests[0]?.eventName ??
        `Event #${eventId}`;

    return (
        <div className="space-y-6 p-2 sm:p-6 text-foreground">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-primary">
                            Equipment Requests
                        </h1>
                        <p className="text-sm text-muted-foreground">{eventName}</p>
                    </div>
                </div>
                <Button
                    type="button"
                    size="sm"
                    onClick={() => navigate(`/equipment-requests/${eventId}/new`, {
                        state: {
                            breadcrumbLabel: 'New Request',
                            breadcrumbLabels: { [String(eventId)]: eventName },
                        },
                    })}
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Request</span>
                </Button>
            </div>

            <DataTable
                columns={requestColumns}
                data={requests}
                isLoading={isLoading}
                isError={isError}
                error={error ?? undefined}
                onRetry={() => void refetch()}
                title="Requests"
                totalElements={requests.length}
                emptyMessage="No equipment requests found for this event."
            />
        </div>
    );
}

export default function EquipmentRequestListMainPage() {
    return (
        <EquipmentRequestListProvider>
            <EquipmentRequestListContent />
        </EquipmentRequestListProvider>
    );
}
