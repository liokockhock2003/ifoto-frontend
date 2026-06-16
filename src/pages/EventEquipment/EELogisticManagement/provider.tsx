import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useAvailableEquipment } from '@/store/queries/equipment';
import { useAllRentals } from '@/store/queries/rental';
import {
    useAllRequests,
    useReviewRequest,
    useUpdateRequestEquipment,
    useUpdateRequestLogistics,
} from '@/store/queries/request';
import type { EquipmentRequest, RequestStatus, SubEquipmentEntry } from '@/store/schemas/request';

import { RequestLogisticContext, type LogisticMode } from './context';

// Fetch everything once; the calendar renders the whole set.
const FETCH_ALL = { page: 0, size: 1000 } as const;

function modeOf(status: RequestStatus): LogisticMode {
    if (status === 'PENDING_REVIEW') return 'review';
    if (status === 'APPROVED' || status === 'PICKED_UP' || status === 'ACTIVE') return 'update';
    return 'view';
}

// DateTimePicker emits `yyyy-MM-ddTHH:mm`; the API wants seconds.
function withSeconds(v: string): string {
    return v.length === 16 ? `${v}:00` : v;
}

type RequestLogisticProviderProps = {
    initialRequestId?: number;
    children: ReactNode;
};

export function RequestLogisticProvider({ initialRequestId, children }: RequestLogisticProviderProps) {
    const query = useAllRequests(FETCH_ALL);
    const allRequests = useMemo(() => query.data?.content ?? [], [query.data]);

    const rentalsQuery = useAllRentals(FETCH_ALL);
    const allRentals = useMemo(() => rentalsQuery.data?.content ?? [], [rentalsQuery.data]);

    // Track the selection by id and derive the request from the (refetchable) list, so the
    // selected request stays fresh after a mutation without a syncing effect.
    const [selectedId, setSelectedId] = useState<number | null>(initialRequestId ?? null);
    const selectedRequest = useMemo(
        () => allRequests.find((r) => r.id === selectedId) ?? null,
        [allRequests, selectedId],
    );

    const [selectedMainIds, setSelectedMainIds] = useState<number[]>([]);
    const [selectedSubQty, setSelectedSubQty] = useState<Record<number, number>>({});
    const [subDirty, setSubDirty] = useState(false);
    const [pickupDatetime, setPickupDatetime] = useState('');
    const [returnDatetime, setReturnDatetime] = useState('');
    const [committeeNotes, setCommitteeNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    const reviewMutation = useReviewRequest();
    const equipmentMutation = useUpdateRequestEquipment();
    const logisticsMutation = useUpdateRequestLogistics();

    // Initialize the editable form fields from a request (or reset when cleared).
    const hydratedIdRef = useRef<number | null>(null);
    const hydrateFields = useCallback((request: EquipmentRequest | null) => {
        setSelectedMainIds(request?.items.map((i) => i.mainEquipmentId) ?? []);
        setSelectedSubQty(
            Object.fromEntries((request?.subItems ?? []).map((s) => [s.subEquipmentId, s.borrowedQuantity ?? 1])),
        );
        setSubDirty(false);
        setPickupDatetime(request?.pickupDatetime?.slice(0, 16) ?? '');
        setReturnDatetime(request?.returnDatetime?.slice(0, 16) ?? '');
        setCommitteeNotes('');
        setRejectionReason('');
    }, []);

    const selectRequest = useCallback((request: EquipmentRequest) => {
        setSelectedId(request.id);
        hydratedIdRef.current = request.id;
        hydrateFields(request);
    }, [hydrateFields]);

    const clearSelection = useCallback(() => {
        setSelectedId(null);
        hydratedIdRef.current = null;
        hydrateFields(null);
    }, [hydrateFields]);

    // Route-driven entry (/calendar/:requestId): hydrate the form once the list loads and the
    // matching request is found. Subsequent selections go through selectRequest (event handler).
    useEffect(() => {
        if (selectedId == null || hydratedIdRef.current === selectedId) return;
        const match = allRequests.find((r) => r.id === selectedId);
        if (!match) return;
        hydratedIdRef.current = selectedId;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing async-loaded data into form state
        hydrateFields(match);
    }, [selectedId, allRequests, hydrateFields]);

    const mode: LogisticMode = selectedRequest ? modeOf(selectedRequest.status) : 'view';

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
        startDate: selectedRequest?.startDatetime?.split('T')[0] ?? '',
        endDate: selectedRequest?.endDatetime?.split('T')[0] ?? '',
        context: 'EVENT_REQUEST',
        // Exclude this request's own holds so its assigned equipment is selectable.
        excludeRequestId: selectedRequest?.id,
    });

    const subEntries = useCallback((): SubEquipmentEntry[] =>
        Object.entries(selectedSubQty)
            .filter(([, q]) => q > 0)
            .map(([id, q]) => ({ subEquipmentId: Number(id), quantity: q })),
    [selectedSubQty]);

    const approve = useCallback(async () => {
        if (!selectedRequest) return;
        try {
            await reviewMutation.mutateAsync({
                id: selectedRequest.id,
                action: 'APPROVE',
                equipmentIds: selectedMainIds,
                // Send entries only when the committee changed accessories; otherwise omit
                // so the backend preserves the requester's original selection.
                ...(subDirty ? { subEquipmentEntries: subEntries() } : {}),
                ...(committeeNotes ? { committeeNotes } : {}),
                ...(pickupDatetime ? { pickupDatetime: withSeconds(pickupDatetime) } : {}),
                ...(returnDatetime ? { returnDatetime: withSeconds(returnDatetime) } : {}),
            });
            toast.success(`Request ${selectedRequest.requestNumber} approved`);
            clearSelection();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to approve request');
        }
    }, [selectedRequest, selectedMainIds, subDirty, subEntries, committeeNotes, pickupDatetime, returnDatetime, reviewMutation, clearSelection]);

    const reject = useCallback(async () => {
        if (!selectedRequest || !rejectionReason.trim()) return;
        try {
            await reviewMutation.mutateAsync({
                id: selectedRequest.id,
                action: 'REJECT',
                rejectionReason,
                ...(committeeNotes ? { committeeNotes } : {}),
            });
            toast.success(`Request ${selectedRequest.requestNumber} rejected`);
            clearSelection();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reject request');
        }
    }, [selectedRequest, rejectionReason, committeeNotes, reviewMutation, clearSelection]);

    const saveEquipment = useCallback(async () => {
        if (!selectedRequest || selectedMainIds.length === 0) return;
        try {
            await equipmentMutation.mutateAsync({
                id: selectedRequest.id,
                equipmentIds: selectedMainIds,
                ...(subDirty ? { subEquipmentEntries: subEntries() } : {}),
            });
            toast.success(`Equipment updated for ${selectedRequest.requestNumber}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update equipment');
        }
    }, [selectedRequest, selectedMainIds, subDirty, subEntries, equipmentMutation]);

    const saveLogistics = useCallback(async () => {
        if (!selectedRequest || !pickupDatetime || !returnDatetime) return;
        try {
            await logisticsMutation.mutateAsync({
                id: selectedRequest.id,
                pickupDatetime: withSeconds(pickupDatetime),
                returnDatetime: withSeconds(returnDatetime),
            });
            toast.success(`Schedule updated for ${selectedRequest.requestNumber}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to update schedule');
        }
    }, [selectedRequest, pickupDatetime, returnDatetime, logisticsMutation]);

    const value = useMemo(
        () => ({
            allRequests,
            allRentals,
            isLoading: query.isLoading,
            isError: query.isError,
            error: query.error ?? null,
            refetch: query.refetch,
            selectedRequest,
            mode,
            selectRequest,
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
            allRequests, allRentals, query, selectedRequest, mode, selectRequest, clearSelection,
            selectedMainIds, selectedSubQty, addMain, removeMain, setSubQty,
            pickupDatetime, returnDatetime, committeeNotes, rejectionReason,
            availableEquipmentQuery, approve, reject, saveEquipment, saveLogistics,
            reviewMutation.isPending, equipmentMutation.isPending, logisticsMutation.isPending,
        ],
    );

    return <RequestLogisticContext.Provider value={value}>{children}</RequestLogisticContext.Provider>;
}
