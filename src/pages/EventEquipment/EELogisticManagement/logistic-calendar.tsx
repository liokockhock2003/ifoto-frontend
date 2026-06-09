import { useMemo } from 'react';

import { ScheduleCalendar } from '@/components/full-calendar';
import { buildScheduleOverlay } from '@/components/equipment-schedules';
import { useRequestEquipmentSchedules } from '@/store/queries/request';

import { useRequestLogisticContext } from './context';

// Calendar of every equipment request; clicking one selects it for management. Rentals are
// overlaid read-only for cross-visibility. When a request is selected, its equipment's
// status windows + quantity holds are overlaid (read-only) on the grid — using the
// committee's live in-memory selection as overrides, so editing equipment refreshes it.
export function LogisticCalendar() {
    const { allRequests, allRentals, selectedRequest, selectRequest, selectedMainIds, selectedSubQty } =
        useRequestLogisticContext();

    const subEquipmentIds = Object.entries(selectedSubQty)
        .filter(([, q]) => q > 0)
        .map(([k]) => Number(k));

    const { data } = useRequestEquipmentSchedules(
        { id: selectedRequest?.id ?? 0, mainEquipmentIds: selectedMainIds, subEquipmentIds },
        { enabled: !!selectedRequest },
    );
    const scheduleOverlay = useMemo(() => buildScheduleOverlay(data), [data]);

    return (
        <ScheduleCalendar
            entries={[]}
            rentals={allRentals}
            requests={allRequests}
            selectedRequestId={selectedRequest?.id}
            scheduleOverlay={scheduleOverlay}
            onRequestClick={(id) => {
                const match = allRequests.find((r) => r.id === id);
                if (match) selectRequest(match);
            }}
            onSelectRange={() => {}}
            onEntryClick={() => {}}
            onEntryDatesChange={() => {}}
        />
    );
}
