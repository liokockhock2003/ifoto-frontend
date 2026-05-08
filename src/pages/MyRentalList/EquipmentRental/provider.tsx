import { useState, type ReactNode } from 'react';
import { EquipmentRentalContext } from './context';

export function EquipmentRentalProvider({ children }: { children: ReactNode }) {
    const [cartIds, setCartIds] = useState<number[]>([]);
    const [startDate, _setStartDate] = useState('');
    const [endDate, _setEndDate] = useState('');
    const [notes, setNotes] = useState('');

    const addToCart = (id: number) => {
        setCartIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const removeFromCart = (id: number) => {
        setCartIds((prev) => prev.filter((x) => x !== id));
    };

    const clearCart = () => {
        setCartIds([]);
        _setStartDate('');
        _setEndDate('');
        setNotes('');
    };

    const setStartDate = (d: string) => {
        _setStartDate(d);
        setCartIds([]);
    };

    const setEndDate = (d: string) => {
        _setEndDate(d);
        setCartIds([]);
    };

    const isInCart = (id: number) => cartIds.includes(id);

    return (
        <EquipmentRentalContext.Provider
            value={{ cartIds, startDate, endDate, notes, addToCart, removeFromCart, clearCart, setStartDate, setEndDate, setNotes, isInCart }}
        >
            {children}
        </EquipmentRentalContext.Provider>
    );
}
