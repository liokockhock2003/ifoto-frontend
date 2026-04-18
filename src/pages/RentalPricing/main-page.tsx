import { useCallback, useMemo, useState } from 'react';
import { ArrowLeft, BadgeDollarSign, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { useBulkUpdateRentalPricing } from '@/store/queries/rental-pricing';
import type { RentalPricingUpdateItem } from '@/store/schemas/rental-pricing';

import { useRentalPricingContext } from './context';
import { RentalPricingProvider } from './provider';
import { createRentalPricingColumns } from './table-column-def';

// ── Page content ──────────────────────────────────────────────────────────────

function RentalPricingContent() {
    const ctx = useRentalPricingContext();
    const mutation = useBulkUpdateRentalPricing();
    const navigate = useNavigate();

    const [editMode, setEditMode] = useState(false);
    const [draft, setDraft] = useState<Record<number, Partial<RentalPricingUpdateItem>>>({});

    const updateDraft = useCallback(
        (id: number, field: keyof RentalPricingUpdateItem, value: number) => {
            setDraft((prev) => ({ ...prev, [id]: { ...(prev[id] ?? {}), [field]: value } }));
        },
        [],
    );

    function handleEnableEdit() {
        setDraft({});
        setEditMode(true);
    }

    function handleDiscard() {
        setDraft({});
        setEditMode(false);
    }

    async function handleSave() {
        const all = [...ctx.studentPricing, ...ctx.nonStudentPricing];
        const items = all.map((item) => {
            const overrides = draft[item.id] ?? {};
            return {
                category:          item.category,
                memberType:        item.memberType,
                rate1Day:          overrides.rate1Day          ?? item.rate1Day,
                rate3Days:         overrides.rate3Days         ?? item.rate3Days,
                ratePerDayExtra:   overrides.ratePerDayExtra   ?? item.ratePerDayExtra,
                latePenaltyPerDay: overrides.latePenaltyPerDay ?? item.latePenaltyPerDay,
            };
        });

        try {
            await mutation.mutateAsync({ items });
            toast.success('Rental pricing updated');
            setEditMode(false);
            setDraft({});
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update pricing');
        }
    }

    const columns = useMemo(
        () => createRentalPricingColumns(editMode, draft, updateDraft),
        [editMode, draft, updateDraft],
    );

    return (
        <div className="space-y-6 p-2 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => navigate('/manage-inventory')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BadgeDollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">Rental Pricing</h1>
                        <p className="text-sm text-muted-foreground">Manage equipment rental rates by member type</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {editMode ? (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-muted-foreground"
                                disabled={mutation.isPending}
                                onClick={handleDiscard}
                            >
                                <X className="h-4 w-4" />
                                Discard
                            </Button>
                            <Button
                                size="sm"
                                disabled={mutation.isPending}
                                onClick={() => void handleSave()}
                            >
                                <Save className="h-4 w-4" />
                                {mutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    ) : (
                        <Button size="sm" onClick={handleEnableEdit}>
                            <Pencil className="h-4 w-4" />
                            Edit Pricing
                        </Button>
                    )}
                </div>
            </div>

            {/* Tables */}
            <div className="space-y-6">
                <DataTable
                    columns={columns}
                    data={ctx.studentPricing}
                    isLoading={ctx.isLoading}
                    isError={ctx.isError}
                    error={ctx.error ?? undefined}
                    onRetry={() => void ctx.refetch()}
                    title="Student Pricing"
                    totalElements={ctx.studentPricing.length}
                    emptyMessage="No student pricing found."
                />

                <DataTable
                    columns={columns}
                    data={ctx.nonStudentPricing}
                    isLoading={ctx.isLoading}
                    isError={ctx.isError}
                    error={ctx.error ?? undefined}
                    onRetry={() => void ctx.refetch()}
                    title="Non-Student Pricing"
                    totalElements={ctx.nonStudentPricing.length}
                    emptyMessage="No non-student pricing found."
                />
            </div>
        </div>
    );
}

// ── Page entry ────────────────────────────────────────────────────────────────

export default function RentalPricingMainPage() {
    return (
        <RentalPricingProvider>
            <RentalPricingContent />
        </RentalPricingProvider>
    );
}
