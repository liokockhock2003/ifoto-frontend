import { createContext, useContext } from 'react';

import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';
import type { Rental } from '@/store/schemas/rental';
import type { EquipmentRequest } from '@/store/schemas/request';

// Mode is derived from the selected request's status:
//   PENDING_REVIEW → review · APPROVED/ACTIVE → update · anything else → view-only.
//   (ACTIVE is "picked up": equipment is locked, only the schedule stays editable.)
export type LogisticMode = 'review' | 'update' | 'view';

export type RequestLogisticContextValue = {
    // Full request list (drives the calendar).
    allRequests: EquipmentRequest[];
    // Rentals overlaid on the calendar (read-only) for cross-visibility.
    allRentals: Rental[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<unknown>;

    // Selection.
    selectedRequest: EquipmentRequest | null;
    mode: LogisticMode;
    selectRequest: (request: EquipmentRequest) => void;
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

    // Availability (re-queried for the selected request's window).
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

export const RequestLogisticContext = createContext<RequestLogisticContextValue | undefined>(undefined);

export function useRequestLogisticContext(): RequestLogisticContextValue {
    const ctx = useContext(RequestLogisticContext);
    if (!ctx) throw new Error('useRequestLogisticContext must be used within <RequestLogisticProvider>');
    return ctx;
}
