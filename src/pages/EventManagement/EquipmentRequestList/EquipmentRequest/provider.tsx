import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';

import { useAvailableEquipment } from '@/store/queries/equipment';
import { useMyEvents } from '@/store/queries/event';

import { EquipmentRequestContext } from './context';

type EquipmentRequestProviderProps = {
    children: ReactNode;
};

export function EquipmentRequestProvider({ children }: EquipmentRequestProviderProps) {
    const { eventId: eventIdParam } = useParams<{ eventId: string }>();
    const eventId = Number(eventIdParam ?? 0);

    const myEventsQuery = useMyEvents();
    const event = myEventsQuery.data?.find((e) => e.eventId === eventId);
    const startDate = event?.startDatetime?.slice(0, 10) ?? '';
    const endDate = event?.endDatetime?.slice(0, 10) ?? '';

    const equipmentQuery = useAvailableEquipment({
        startDate: startDate ?? '',
        endDate: endDate ?? '',
        context: 'EVENT_REQUEST',
    });

    const [cartIds, setCartIds] = useState<number[]>([]);
    const [notes, setNotes] = useState('');
    const [subQty, setSubQtyState] = useState<Record<number, number>>({});

    const addToCart = useCallback((id: number) => {
        setCartIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const removeFromCart = useCallback((id: number) => {
        setCartIds((prev) => prev.filter((i) => i !== id));
    }, []);

    const isInCart = useCallback((id: number) => cartIds.includes(id), [cartIds]);

    const setSubQty = useCallback((id: number, qty: number) => {
        setSubQtyState((prev) => ({ ...prev, [id]: qty }));
    }, []);

    const clearCart = useCallback(() => {
        setCartIds([]);
        setNotes('');
        setSubQtyState({});
    }, []);

    const value = useMemo(
        () => ({
            mainEquipment: equipmentQuery.data?.mainEquipment ?? [],
            subEquipment: equipmentQuery.data?.subEquipment ?? [],
            isEquipmentLoading: equipmentQuery.isLoading,
            cartIds,
            startDate,
            endDate,
            notes,
            eventId,
            subQty,
            setSubQty,
            addToCart,
            removeFromCart,
            isInCart,
            setNotes,
            clearCart,
        }),
        [
            equipmentQuery.data,
            equipmentQuery.isLoading,
            cartIds,
            startDate,
            endDate,
            notes,
            eventId,
            subQty,
            setSubQty,
            addToCart,
            removeFromCart,
            isInCart,
            clearCart,
        ],
    );

    return (
        <EquipmentRequestContext.Provider value={value}>
            {children}
        </EquipmentRequestContext.Provider>
    );
}
