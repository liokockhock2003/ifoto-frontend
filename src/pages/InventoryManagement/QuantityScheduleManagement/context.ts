import { createContext, useContext } from 'react';

import type { SubEquipment, SubEquipmentQuantityHold, SubEquipmentQuantityHoldPayload } from '@/store/schemas/equipment';
import type { Rental } from '@/store/schemas/rental';
import type { EquipmentRequest } from '@/store/schemas/request';

import type { HoldDialogMode } from './constants';

export type QuantityScheduleContextValue = {
    equipment: SubEquipment;
    holds: SubEquipmentQuantityHold[];
    isLoading: boolean;
    rentals?: Rental[];
    requests?: EquipmentRequest[];
    mode: HoldDialogMode;
    openAdd: (start?: string, end?: string) => void;
    openManage: (entry: SubEquipmentQuantityHold) => void;
    closeMode: () => void;
    saveEntry: (payload: SubEquipmentQuantityHoldPayload, editingId?: number) => Promise<void>;
    deleteEntry: (holdId: number) => Promise<void>;
    rescheduleEntry: (holdId: number, startDatetime: string, endDatetime: string) => Promise<void>;
    isSaving: boolean;
    isDeleting: boolean;
};

export const QuantityScheduleContext = createContext<QuantityScheduleContextValue | undefined>(undefined);

export function useQuantityScheduleContext(): QuantityScheduleContextValue {
    const ctx = useContext(QuantityScheduleContext);
    if (!ctx) throw new Error('useQuantityScheduleContext must be used within <QuantityScheduleProvider>');
    return ctx;
}
