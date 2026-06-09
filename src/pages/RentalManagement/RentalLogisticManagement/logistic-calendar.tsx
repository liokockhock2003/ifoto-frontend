import { useMemo } from 'react';

import { ScheduleCalendar } from '@/components/full-calendar';
import { buildScheduleOverlay } from '@/components/equipment-schedules';
import { useRentalEquipmentSchedules } from '@/store/queries/rental';

import { useRentalLogisticContext } from './context';

// Calendar of every rental; clicking one selects it for management. When a rental is
// selected, its equipment's status windows + quantity holds are overlaid (read-only) on
// the grid — using the committee's live in-memory selection as overrides, so editing
// equipment in the action panel refreshes the overlay.
export function LogisticCalendar() {
    const { allRentals, allRequests, selectedRental, selectRental, selectedMainIds, selectedSubQty } =
        useRentalLogisticContext();

    const subEquipmentIds = Object.entries(selectedSubQty)
        .filter(([, q]) => q > 0)
        .map(([k]) => Number(k));

    const { data } = useRentalEquipmentSchedules(
        { id: selectedRental?.id ?? 0, mainEquipmentIds: selectedMainIds, subEquipmentIds },
        { enabled: !!selectedRental },
    );
    const scheduleOverlay = useMemo(() => buildScheduleOverlay(data), [data]);

    return (
        <ScheduleCalendar
            entries={[]}
            rentals={allRentals}
            requests={allRequests}
            selectedRentalId={selectedRental?.id}
            scheduleOverlay={scheduleOverlay}
            onRentalClick={(id) => {
                const match = allRentals.find((r) => r.id === id);
                if (match) selectRental(match);
            }}
            onSelectRange={() => {}}
            onEntryClick={() => {}}
            onEntryDatesChange={() => {}}
        />
    );
}
