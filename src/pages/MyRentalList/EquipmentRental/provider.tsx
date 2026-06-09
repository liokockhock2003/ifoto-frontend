import { useState, type ReactNode } from 'react';
import { EquipmentRentalContext } from './context';

export function EquipmentRentalProvider({ children }: { children: ReactNode }) {
    const [cartIds, setCartIds] = useState<number[]>([]);
    const [subQty, setSubQtyState] = useState<Record<number, number>>({});
    const [startDate, _setStartDate] = useState('');
    const [endDate, _setEndDate] = useState('');
    const [notes, setNotes] = useState('');

    const addToCart = (id: number) => {
        setCartIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const removeFromCart = (id: number) => {
        setCartIds((prev) => prev.filter((x) => x !== id));
    };

    const setSubQty = (subEquipmentId: number, qty: number) => {
        setSubQtyState((prev) => {
            if (qty <= 0) {
                const { [subEquipmentId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [subEquipmentId]: qty };
        });
    };

    const clearCart = () => {
        setCartIds([]);
        setSubQtyState({});
        _setStartDate('');
        _setEndDate('');
        setNotes('');
    };

    const setStartDate = (d: string) => {
        _setStartDate(d);
        setCartIds([]);
        setSubQtyState({});
    };

    const setEndDate = (d: string) => {
        _setEndDate(d);
        setCartIds([]);
        setSubQtyState({});
    };

    const isInCart = (id: number) => cartIds.includes(id);

    return (
        <EquipmentRentalContext.Provider
            value={{ cartIds, subQty, startDate, endDate, notes, addToCart, removeFromCart, clearCart, setStartDate, setEndDate, setNotes, isInCart, setSubQty }}
        >
            {children}
        </EquipmentRentalContext.Provider>
    );
}
