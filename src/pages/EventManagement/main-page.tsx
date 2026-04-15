import { useState } from 'react';
import { CalendarDays, Plus } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';

import { useEventManagementContext } from './context';
import { EventCreateDialog } from './dialog-create';
import { EventManagementProvider } from './provider';
import { eventColumns } from './table-column-def';

function EventManagementContent() {
    const { events, isLoading, isError, error, refetch } = useEventManagementContext();
    const [openCreate, setOpenCreate] = useState(false);

    return (
        <div className="space-y-6 p-2 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-primary">
                        Event Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage All Kelab Fotokreatif Events
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="button" size="sm" onClick={() => setOpenCreate(true)}>
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Event</span>
                </Button>
            </div>

            <DataTable
                columns={eventColumns}
                data={events}
                isLoading={isLoading}
                isError={isError}
                error={error ?? undefined}
                onRetry={() => void refetch()}
                title="Events"
                totalElements={events.length}
                emptyMessage="No events found."
            />

            <EventCreateDialog open={openCreate} onOpenChange={setOpenCreate} />
        </div>
    );
}

export default function EventManagementMainPage() {
    return (
        <EventManagementProvider>
            <EventManagementContent />
        </EventManagementProvider>
    );
}
