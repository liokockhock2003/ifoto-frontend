import { ArrowLeft, CalendarRange } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import { RequestLogisticProvider } from './provider';
import { LogisticCalendar } from './logistic-calendar';
import { RequestActionPanel } from './action-panel';
import { AvailableEquipment } from './available-equipment';

export default function RequestLogisticMainPage() {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const initialRequestId = requestId ? Number(requestId) : undefined;

    return (
        <RequestLogisticProvider initialRequestId={initialRequestId}>
            <div className="space-y-6 p-2 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <CalendarRange className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-primary">Event Equipment Logistics</h1>
                        <p className="text-sm text-muted-foreground">
                            Click a request on the calendar to review or update its equipment and schedule.
                        </p>
                    </div>
                </div>

                {/* Action panel (left) + calendar (right) */}
                <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
                    <RequestActionPanel />
                    <LogisticCalendar />
                </div>

                {/* Available equipment for the selected request's window */}
                <AvailableEquipment />
            </div>
        </RequestLogisticProvider>
    );
}
