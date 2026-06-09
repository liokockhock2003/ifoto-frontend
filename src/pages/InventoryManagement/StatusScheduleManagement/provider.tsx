import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import {
    useCreateEquipmentStatus,
    useDeleteEquipmentStatus,
    useEquipmentStatuses,
    useUpdateEquipmentStatus,
} from '@/store/queries/equipment';
import { useRentalsByEquipment } from '@/store/queries/rental';
import { useRequestsByEquipment } from '@/store/queries/request';
import type { EquipmentDateStatus, EquipmentStatusPayload, MainEquipment } from '@/store/schemas/equipment';

import { StatusScheduleContext } from './context';
import type { SchedulableStatus, StatusDialogMode } from './constants';

type StatusScheduleProviderProps = {
    equipment: MainEquipment;
    children: ReactNode;
};

export function StatusScheduleProvider({ equipment, children }: StatusScheduleProviderProps) {
    const mainEquipmentId = equipment.mainEquipmentId;

    const { data: statuses, isLoading } = useEquipmentStatuses(mainEquipmentId);
    const { data: rentals } = useRentalsByEquipment(mainEquipmentId);
    const { data: requests } = useRequestsByEquipment(mainEquipmentId);

    const [mode, setMode] = useState<StatusDialogMode>({ type: 'idle' });

    const createMutation = useCreateEquipmentStatus();
    const updateMutation = useUpdateEquipmentStatus();
    const deleteMutation = useDeleteEquipmentStatus();

    const openAdd = useCallback((start?: string, end?: string) => setMode({ type: 'add', start, end }), []);
    const openManage = useCallback((entry: EquipmentDateStatus) => setMode({ type: 'manage', entry }), []);
    const closeMode = useCallback(() => setMode({ type: 'idle' }), []);

    const saveEntry = useCallback(
        async (payload: EquipmentStatusPayload, editingId?: number) => {
            try {
                if (editingId != null) {
                    await updateMutation.mutateAsync({ mainEquipmentId, statusId: editingId, ...payload });
                } else {
                    await createMutation.mutateAsync({ mainEquipmentId, ...payload });
                }
                setMode({ type: 'idle' });
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to save status');
            }
        },
        [mainEquipmentId, createMutation, updateMutation],
    );

    const deleteEntry = useCallback(
        async (statusId: number) => {
            try {
                await deleteMutation.mutateAsync({ mainEquipmentId, statusId });
                setMode({ type: 'idle' });
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to delete status');
            }
        },
        [mainEquipmentId, deleteMutation],
    );

    // Drag/resize on the calendar changes only dates — preserve type + notes.
    const rescheduleEntry = useCallback(
        async (statusId: number, startDatetime: string, endDatetime: string) => {
            const entry = statuses?.find((s) => s.id === statusId);
            if (!entry) return;
            try {
                await updateMutation.mutateAsync({
                    mainEquipmentId,
                    statusId,
                    statusType: entry.statusType as SchedulableStatus,
                    startDatetime,
                    endDatetime,
                    notes: entry.notes ?? undefined,
                });
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to update status');
            }
        },
        [mainEquipmentId, statuses, updateMutation],
    );

    const value = useMemo(
        () => ({
            equipment,
            statuses: statuses ?? [],
            isLoading,
            rentals,
            requests,
            mode,
            openAdd,
            openManage,
            closeMode,
            saveEntry,
            deleteEntry,
            rescheduleEntry,
            isSaving: createMutation.isPending || updateMutation.isPending,
            isDeleting: deleteMutation.isPending,
        }),
        [
            equipment,
            statuses,
            isLoading,
            rentals,
            requests,
            mode,
            openAdd,
            openManage,
            closeMode,
            saveEntry,
            deleteEntry,
            rescheduleEntry,
            createMutation.isPending,
            updateMutation.isPending,
            deleteMutation.isPending,
        ],
    );

    return <StatusScheduleContext.Provider value={value}>{children}</StatusScheduleContext.Provider>;
}
