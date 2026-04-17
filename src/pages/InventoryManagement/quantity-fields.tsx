import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type QuantityValues = {
    totalQuantity: number;
    usedQuantity: number;
    availableQuantity: number;
};

type QuantityFieldsProps = {
    value: QuantityValues;
    onChange: (values: QuantityValues) => void;
    className?: string;
};

export function QuantityFields({ value, onChange, className }: QuantityFieldsProps) {
    const { totalQuantity, usedQuantity, availableQuantity } = value;

    const availPct = totalQuantity > 0 ? (availableQuantity / totalQuantity) * 100 : 0;
    const usedPct  = totalQuantity > 0 ? (usedQuantity  / totalQuantity) * 100 : 0;

    function parseQty(raw: string): number {
        const n = Number(raw);
        return isNaN(n) ? 0 : Math.max(0, Math.floor(n));
    }

    function handleTotal(e: React.ChangeEvent<HTMLInputElement>) {
        const total = parseQty(e.target.value);
        const used  = Math.min(usedQuantity, total);
        onChange({ totalQuantity: total, usedQuantity: used, availableQuantity: total - used });
    }

    function handleAvailable(e: React.ChangeEvent<HTMLInputElement>) {
        const avail = Math.min(totalQuantity, parseQty(e.target.value));
        onChange({ totalQuantity, availableQuantity: avail, usedQuantity: totalQuantity - avail });
    }

    function handleUsed(e: React.ChangeEvent<HTMLInputElement>) {
        const used = Math.min(totalQuantity, parseQty(e.target.value));
        onChange({ totalQuantity, usedQuantity: used, availableQuantity: totalQuantity - used });
    }

    return (
        <div className={cn('space-y-3', className)}>
            <Field>
                <FieldLabel>Total Quantity</FieldLabel>
                <Input type="number" min={0} value={totalQuantity} onChange={handleTotal} />
            </Field>

            {/* Split bar */}
            <div className="space-y-1.5">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                        className="bg-emerald-500 transition-all duration-200"
                        style={{ width: `${availPct}%` }}
                    />
                    <div
                        className="bg-orange-400 transition-all duration-200"
                        style={{ width: `${usedPct}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="inline-block size-2 rounded-full bg-emerald-500" />
                        Available&nbsp;
                        <span className="tabular-nums">{availPct.toFixed(0)}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                        Used&nbsp;
                        <span className="tabular-nums">{usedPct.toFixed(0)}%</span>
                        <span className="inline-block size-2 rounded-full bg-orange-400" />
                    </span>
                </div>
            </div>

            {/* Equation row: Available + Used = Total */}
            <div className="flex items-end gap-2">
                <Field className="flex-1">
                    <FieldLabel>Available</FieldLabel>
                    <Input
                        type="number"
                        min={0}
                        max={totalQuantity}
                        value={availableQuantity}
                        onChange={handleAvailable}
                    />
                </Field>

                <span className="mb-2 shrink-0 text-sm font-medium text-muted-foreground">+</span>

                <Field className="flex-1">
                    <FieldLabel>Used</FieldLabel>
                    <Input
                        type="number"
                        min={0}
                        max={totalQuantity}
                        value={usedQuantity}
                        onChange={handleUsed}
                    />
                </Field>

                <span className="mb-2 shrink-0 text-sm font-medium text-muted-foreground">=</span>

                <div className="mb-1.5 shrink-0 min-w-[2.5rem] text-center">
                    <p className="text-xs text-muted-foreground leading-snug">Total</p>
                    <p className="text-sm font-semibold text-foreground tabular-nums">{totalQuantity}</p>
                </div>
            </div>
        </div>
    );
}
