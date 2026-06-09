import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useAvailableEquipment } from '@/store/queries/equipment';
import {
    useAllRentals,
    useReviewRental,
    useUpdateEquipment,
    useUpdateLogistics,
} from '@/store/queries/rental';
import { useAllRequests } from '@/store/queries/request';
import type { Rental, RentalStatus, SubEquipmentEntry } from '@/store/schemas/rental';

import { RentalLogisticContext, type LogisticMode } from './context';

// Fetch all rentals once; the calendar renders the whole set.
const FETCH_ALL = { page: 0, size: 1000 } as const;

function modeOf(status: RentalStatus): LogisticMode {
    if (status === 'PENDING_REVIEW') return 'review';
    if (status === 'APPROVED' || status === 'PICKED_UP') return 'update';
    return 'view';
}

// DateTimePicker emits `yyyy-MM-ddTHH:mm`; the API wants seconds.
function withSeconds(v: string): string {
    return v.length === 16 ? `${v}:00` : v;
}

type RentalLogisticProviderProps = {
    initialRentalId?: number;
    children: ReactNode;
};

export function RentalLogisticProvider({ initialRentalId, children }: RentalLogisticProviderProps) {
    const query = useAllRentals(FETCH_ALL);
    const allRentals = useMemo(() => query.data?.content ?? [], [query.data]);

    const requestsQuery = useAllRequests(FETCH_ALL);
    const allRequests = useMemo(() => requestsQuery.data?.content ?? [], [requestsQuery.data]);

    // Track the selection by id and derive the rental from the (refetchable) list, so the
    // selected rental stays fresh after a mutation without a syncing effect.
    const [selectedId, setSelectedId] = useState<number | null>(initialRentalId ?? null);
    const selectedRental = useMemo(
        () => allRentals.find((r) => r.id === selectedId) ?? null,
        [allRentals, selectedId],
    );

    const [selectedMainIds, setSelectedMainIds] = useState<number[]>([]);
    const [selectedSubQty, setSelectedSubQty] = useState<Record<number, number>>({});
    const [subDirty, setSubDirty] = useState(false);
    const [pickupDatetime, setPickupDatetime] = useState('');
    const [returnDatetime, setReturnDatetime] = useState('');
    const [committeeNotes, setCommitteeNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const reviewMutation = useReviewRental();
    const equipmentMutation = useUpdateEquipment();
    const logisticsMutation = useUpdateLogistics();

    // Initialize the editable form fields from a rental (or reset when cleared).
    const hydratedIdRef = useRef<number | null>(null);
    const hydrateFields = useCallback((rental: Rental | null) => {
        setSelectedMainIds(rental?.items.map((i) => i.mainEquipmentId) ?? []);
        setSelectedSubQty(
            Object.fromEntries((rental?.subItems ?? []).map((s) => [s.subEquipmentId, s.borrowedQuantity])),
        );
        setSubDirty(false);
        setPickupDatetime(rental?.pickupDatetime?.slice(0, 16) ?? '');
        setReturnDatetime(rental?.returnDatetime?.slice(0, 16) ?? '');
        setCommitteeNotes('');
        setRejectionReason('');
    }, []);

    const selectRental = useCallback((rental: Rental) => {
        setSelectedId(rental.id);
        hydratedIdRef.current = rental.id;
        hydrateFields(rental);
    }, [hydrateFields]);

    const clearSelection = useCallback(() => {
        setSelectedId(null);
        hydratedIdRef.current = null;
        hydrateFields(null);
    }, [hydrateFields]);

    // Route-driven entry (/calendar/:rentalId): hydrate the form once the list loads and the
    // matching rental is found. Subsequent selections go through selectRental (event handler).
    useEffect(() => {
        if (selectedId == null || hydratedIdRef.current === selectedId) return;
        const match = allRentals.find((r) => r.id === selectedId);
        if (!match) return;
        hydratedIdRef.current = selectedId;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing async-loaded data into form state
        hydrateFields(match);
    }, [selectedId, allRentals, hydrateFields]);

    const mode: LogisticMode = selectedRental ? modeOf(selectedRental.status) : 'view';

    const addMain = useCallback(
        (id: number) => setSelectedMainIds((prev) => (prev.includes(id) ? prev : [...prev, id])),
        [],
    );
    const removeMain = useCallback(
        (id: number) => setSelectedMainIds((prev) => prev.filter((v) => v !== id)),
        [],
    );
    const setSubQty = useCallback((id: number, qty: number) => {
        setSubDirty(true);
        setSelectedSubQty((prev) => ({ ...prev, [id]: Math.max(0, qty) }));
    }, []);

    const availableEquipmentQuery = useAvailableEquipment({
        startDate: selectedRental?.programStartDate ?? '',
        endDate: selectedRental?.programEndDate ?? '',
        context: 'RENTAL',
        // Exclude this rental's own holds so its assigned equipment is selectable.
        excludeRentalId: selectedRental?.id,
    });

    const subEntries = useCallback((): SubEquipmentEntry[] =>
        Object.entries(selectedSubQty)
            .filter(([, q]) => q > 0)
            .map(([id, q]) => ({ subEquipmentId: Number(id), quantity: q })),
    [selectedSubQty]);

    const approve = useCallback(async () => {
        if (!selectedRental) return;
        try {
            await reviewMutation.mutateAsync({
                id: selectedRental.id,
                action: 'APPROVE',
                equipmentIds: selectedMainIds,
                // Send entries only when the committee changed accessories; otherwise omit
                // so the backend preserves the renter's original selection.
                ...(subDirty ? { subEquipmentEntries: subEntries() } : {}),
                ...(committeeNotes ? { committeeNotes } : {}),
                ...(pickupDatetime ? { pickupDatetime: withSeconds(pickupDatetime) } : {}),
                ...(returnDatetime ? { returnDatetime: withSeconds(returnDatetime) } : {}),
            });
            toast.success(`Rental ${selectedRental.rentalNumber} approved`);
            clearSelection();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to approve rental');
        }
    }, [selectedRental, selectedMainIds, subDirty, subEntries, committeeNotes, pickupDatetime, returnDatetime, reviewMutation, clearSelection]);

    const reject = useCallback(async () => {
        if (!selectedRental || !rejectionReason.trim()) return;
        try {
            await reviewMutation.mutateAsync({
                id: selectedRental.id,
                action: 'REJECT',
                rejectionReason,
                ...(committeeNotes ? { committeeNotes } : {}),
            });
            toast.success(`Rental ${selectedRental.rentalNumber} rejected`);
            clearSelection();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reject rental');
        }
    }, [selectedRental, rejectionReason, committeeNotes, reviewMutation, clearSelection]);

    const saveEquipment = useCallback(async () => {
        if (!selectedRental || selectedMainIds.length === 0) return;
        try {
            await equipmentMutation.mutateAsync({
                id: selectedRental.id,
                equipmentIds: selectedMainIds,
                ...(subDirty ? { subEquipmentEntries: subEntries() } : {}),
            });
            toast.success(`Equipment updated for ${selectedRental.rentalNumber}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update equipment');
        }
    }, [selectedRental, selectedMainIds, subDirty, subEntries, equipmentMutation]);

    const saveLogistics = useCallback(async () => {
        if (!selectedRental || !pickupDatetime || !returnDatetime) return;
        try {
            await logisticsMutation.mutateAsync({
                id: selectedRental.id,
                pickupDatetime: withSeconds(pickupDatetime),
                returnDatetime: withSeconds(returnDatetime),
            });
            toast.success(`Schedule updated for ${selectedRental.rentalNumber}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update schedule');
        }
    }, [selectedRental, pickupDatetime, returnDatetime, logisticsMutation]);

    const value = useMemo(
        () => ({
            allRentals,
            allRequests,
            isLoading: query.isLoading,
            isError: query.isError,
            error: query.error ?? null,
            refetch: query.refetch,
            selectedRental,
            mode,
            selectRental,
            clearSelection,
            selectedMainIds,
            selectedSubQty,
            addMain,
            removeMain,
            setSubQty,
            pickupDatetime,
            returnDatetime,
            committeeNotes,
            rejectionReason,
            setPickupDatetime,
            setReturnDatetime,
            setCommitteeNotes,
            setRejectionReason,
            availableEquipment: availableEquipmentQuery.data?.mainEquipment ?? [],
            availableSubEquipment: availableEquipmentQuery.data?.subEquipment ?? [],
            isAvailableEquipmentLoading: availableEquipmentQuery.isLoading,
            approve,
            reject,
            saveEquipment,
            saveLogistics,
            isPending: reviewMutation.isPending || equipmentMutation.isPending || logisticsMutation.isPending,
        }),
        [
            allRentals, allRequests, query, selectedRental, mode, selectRental, clearSelection,
            selectedMainIds, selectedSubQty, addMain, removeMain, setSubQty,
            pickupDatetime, returnDatetime, committeeNotes, rejectionReason,
            availableEquipmentQuery, approve, reject, saveEquipment, saveLogistics,
            reviewMutation.isPending, equipmentMutation.isPending, logisticsMutation.isPending,
        ],
    );

    return <RentalLogisticContext.Provider value={value}>{children}</RentalLogisticContext.Provider>;
}
