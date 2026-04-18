import { useState } from 'react';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import type { RentalPricing, RentalPricingUpdateItem } from '@/store/schemas/rental-pricing';

const helper = createColumnHelper<RentalPricing>();

const CATEGORY_LABELS: Record<string, string> = {
    CAMERA:      'Camera',
    SPEEDLIGHT:  'Speedlight',
    LENS_NORMAL: 'Lens (Normal)',
    LENS_TELE:   'Lens (Telephoto)',
};

function rm(value: number) {
    return `RM ${value.toFixed(2)}`;
}

type PricingInputCellProps = {
    initialValue: number;
    id: number;
    field: keyof Omit<RentalPricingUpdateItem, 'category' | 'memberType'>;
    onUpdate: (id: number, field: keyof RentalPricingUpdateItem, value: number) => void;
};

function PricingInputCell({ initialValue, id, field, onUpdate }: PricingInputCellProps) {
    const [raw, setRaw] = useState(String(initialValue));

    return (
        <Input
            type="number"
            min={0}
            step={0.01}
            value={raw}
            onChange={(e) => {
                setRaw(e.target.value);
                const n = Number(e.target.value);
                if (!isNaN(n)) onUpdate(id, field, n);
            }}
            onBlur={() => {
                if (isNaN(Number(raw)) || raw === '') setRaw(String(initialValue));
            }}
            className="h-8 w-28 tabular-nums"
        />
    );
}

function numCell(
    value: number,
    id: number,
    field: keyof Omit<RentalPricingUpdateItem, 'category' | 'memberType'>,
    editMode: boolean,
    onUpdate: (id: number, field: keyof RentalPricingUpdateItem, value: number) => void,
) {
    if (!editMode) return <span className="tabular-nums">{rm(value)}</span>;
    return <PricingInputCell initialValue={value} id={id} field={field} onUpdate={onUpdate} />;
}

export function createRentalPricingColumns(
    editMode: boolean,
    onUpdate: (id: number, field: keyof RentalPricingUpdateItem, value: number) => void,
): ColumnDef<RentalPricing, any>[] {
    return [
        helper.accessor('category', {
            header: 'Category',
            cell: (info) => CATEGORY_LABELS[info.getValue()] ?? info.getValue(),
        }),
        helper.accessor('rate1Day', {
            header: '1-Day Rate',
            cell: (info) => numCell(info.getValue(), info.row.original.id, 'rate1Day', editMode, onUpdate),
        }),
        helper.accessor('rate3Days', {
            header: '3-Day Rate',
            cell: (info) => numCell(info.getValue(), info.row.original.id, 'rate3Days', editMode, onUpdate),
        }),
        helper.accessor('ratePerDayExtra', {
            header: 'Extra Day Rate',
            cell: (info) => numCell(info.getValue(), info.row.original.id, 'ratePerDayExtra', editMode, onUpdate),
        }),
        helper.accessor('latePenaltyPerDay', {
            header: 'Late Penalty / Day',
            cell: (info) => numCell(info.getValue(), info.row.original.id, 'latePenaltyPerDay', editMode, onUpdate),
        }),
    ];
}
