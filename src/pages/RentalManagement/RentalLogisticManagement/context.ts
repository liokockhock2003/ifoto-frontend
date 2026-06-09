import { createContext, useContext } from 'react';

import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import type { Rental } from '@/store/schemas/rental';
import type { EquipmentRequest } from '@/store/schemas/request';

// Mode is derived from the selected rental's status:
//   PENDING_REVIEW → review · APPROVED/PICKED_UP → update · anything else → view-only.
export type LogisticMode = 'review' | 'update' | 'view';

export type RentalLogisticContextValue = {
    // Full rental list (drives the calendar).
    allRentals: Rental[];
    // Event equipment requests overlaid on the calendar (read-only).
    allRequests: EquipmentRequest[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;

    // Selection.
    selectedRental: Rental | null;
    mode: LogisticMode;
    selectRental: (rental: Rental) => void;
    clearSelection: () => void;

    // Editable equipment.
    selectedMainIds: number[];
    selectedSubQty: Record<number, number>;
    addMain: (id: number) => void;
    removeMain: (id: number) => void;
    setSubQty: (id: number, qty: number) => void;

    // Editable logistics.
    pickupDatetime: string;
    returnDatetime: string;
    committeeNotes: string;
    rejectionReason: string;
    setPickupDatetime: (v: string) => void;
    setReturnDatetime: (v: string) => void;
    setCommitteeNotes: (v: string) => void;
    setRejectionReason: (v: string) => void;

    // Availability (re-queried for the selected rental's window).
    availableEquipment: MainEquipment[];
    availableSubEquipment: SubEquipment[];
    isAvailableEquipmentLoading: boolean;

    // Actions.
    approve: () => Promise<void>;
    reject: () => Promise<void>;
    saveEquipment: () => Promise<void>;
    saveLogistics: () => Promise<void>;
    isPending: boolean;
};

export const RentalLogisticContext = createContext<RentalLogisticContextValue | undefined>(undefined);

export function useRentalLogisticContext(): RentalLogisticContextValue {
    const ctx = useContext(RentalLogisticContext);
    if (!ctx) throw new Error('useRentalLogisticContext must be used within <RentalLogisticProvider>');
    return ctx;
}
