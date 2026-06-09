import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import {
    useCreateQuantityHold,
    useDeleteQuantityHold,
    useSubEquipmentQuantityHolds,
    useUpdateQuantityHold,
} from '@/store/queries/equipment';
import { useRentalsBySubEquipment } from '@/store/queries/rental';
import { useRequestsBySubEquipment } from '@/store/queries/request';
import type { SubEquipment, SubEquipmentQuantityHold, SubEquipmentQuantityHoldPayload } from '@/store/schemas/equipment';

import { QuantityScheduleContext } from './context';
import type { HoldDialogMode } from './constants';

type QuantityScheduleProviderProps = {
    equipment: SubEquipment;
    children: ReactNode;
};

export function QuantityScheduleProvider({ equipment, children }: QuantityScheduleProviderProps) {
    const subEquipmentId = equipment.subEquipmentId;

    const { data: holds, isLoading } = useSubEquipmentQuantityHolds(subEquipmentId);
    const { data: rentals } = useRentalsBySubEquipment(subEquipmentId);
    const { data: requests } = useRequestsBySubEquipment(subEquipmentId);

    const [mode, setMode] = useState<HoldDialogMode>({ type: 'idle' });

    const createMutation = useCreateQuantityHold();
    const updateMutation = useUpdateQuantityHold();
    const deleteMutation = useDeleteQuantityHold();

    const openAdd = useCallback((start?: string, end?: string) => setMode({ type: 'add', start, end }), []);
    const openManage = useCallback((entry: SubEquipmentQuantityHold) => setMode({ type: 'manage', entry }), []);
    const closeMode = useCallback(() => setMode({ type: 'idle' }), []);

    const saveEntry = useCallback(
        async (payload: SubEquipmentQuantityHoldPayload, editingId?: number) => {
            try {
                if (editingId != null) {
                    await updateMutation.mutateAsync({ subEquipmentId, holdId: editingId, ...payload });
                } else {
                    await createMutation.mutateAsync({ subEquipmentId, ...payload });
                }
                setMode({ type: 'idle' });
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to save hold');
            }
        },
        [subEquipmentId, createMutation, updateMutation],
    );

    const deleteEntry = useCallback(
        async (holdId: number) => {
            try {
                await deleteMutation.mutateAsync({ subEquipmentId, holdId });
                setMode({ type: 'idle' });
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to delete schedule');
            }
        },
        [subEquipmentId, deleteMutation],
    );

    // Drag/resize on the calendar changes only dates — preserve quantity + notes.
    const rescheduleEntry = useCallback(
        async (holdId: number, startDatetime: string, endDatetime: string) => {
            const entry = holds?.find((h) => h.id === holdId);
            if (!entry) return;
            try {
                await updateMutation.mutateAsync({
                    subEquipmentId,
                    holdId,
                    quantity: entry.quantity,
                    startDatetime,
                    endDatetime,
                    notes: entry.notes ?? undefined,
                });
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'Failed to update schedule');
            }
        },
        [subEquipmentId, holds, updateMutation],
    );

    const value = useMemo(
        () => ({
            equipment,
            holds: holds ?? [],
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
            holds,
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

    return <QuantityScheduleContext.Provider value={value}>{children}</QuantityScheduleContext.Provider>;
}
