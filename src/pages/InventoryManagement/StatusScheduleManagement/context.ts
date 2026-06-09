import { createContext, useContext } from 'react';

import type { EquipmentDateStatus, EquipmentStatusPayload, MainEquipment } from '@/store/schemas/equipment';
import type { Rental } from '@/store/schemas/rental';
import type { EquipmentRequest } from '@/store/schemas/request';

import type { StatusDialogMode } from './constants';

export type StatusScheduleContextValue = {
    equipment: MainEquipment;
    statuses: EquipmentDateStatus[];
    isLoading: boolean;
    rentals?: Rental[];
    requests?: EquipmentRequest[];
    mode: StatusDialogMode;
    openAdd: (start?: string, end?: string) => void;
    openManage: (entry: EquipmentDateStatus) => void;
    closeMode: () => void;
    saveEntry: (payload: EquipmentStatusPayload, editingId?: number) => Promise<void>;
    deleteEntry: (statusId: number) => Promise<void>;
    rescheduleEntry: (statusId: number, startDatetime: string, endDatetime: string) => Promise<void>;
    isSaving: boolean;
    isDeleting: boolean;
};

export const StatusScheduleContext = createContext<StatusScheduleContextValue | undefined>(undefined);

export function useStatusScheduleContext(): StatusScheduleContextValue {
    const ctx = useContext(StatusScheduleContext);
    if (!ctx) throw new Error('useStatusScheduleContext must be used within <StatusScheduleProvider>');
    return ctx;
}
