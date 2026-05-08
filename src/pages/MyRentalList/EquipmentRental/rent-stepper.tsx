import {
    Banknote,
    CalendarDays,
    Check,
    CreditCard,
    LoaderCircle,
    Receipt,
    ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/reui/badge';
import {
    Stepper,
    StepperContent,
    StepperIndicator,
    StepperItem,
    StepperNav,
    StepperPanel,
    StepperSeparator,
    StepperTitle,
    StepperTrigger,
} from '@/components/reui/stepper';
import { DatePicker } from '@/components/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useRentableEquipment } from '@/store/queries/equipment';
import { useCreateRental, usePayRental } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

import { useEquipmentRentalContext } from './context';
import { rentableEquipmentColumns } from './table-column-def';
import { ReceiptView } from './Receipts/receipt-view';

// ── Steps definition ──────────────────────────────────────────────────────────

const STEPS = [
    { id: 1, label: 'Pick Dates',    icon: <CalendarDays className="size-4" /> },
    { id: 2, label: 'Add Equipment', icon: <ShoppingCart  className="size-4" /> },
    { id: 3, label: 'Payment',       icon: <CreditCard    className="size-4" /> },
    { id: 4, label: 'Receipt',       icon: <Receipt       className="size-4" /> },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function rentalDays(startDate: string, endDate: string): number {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
}

function itemPrice(rate1Day: number, rate3Days: number, ratePerDayExtra: number, days: number): number {
    // Tiered pricing: per-day up to 2 → 3-day flat → daily extra beyond 3
    if (days < 3) return rate1Day * days;
    if (days === 3) return rate3Days;
    return rate3Days + (days - 3) * ratePerDayExtra;
}

// Rates from rentable equipment are in RM
function fmtRM(amount: number) {
    return `RM ${amount.toFixed(2)}`;
}

// Amounts from rental response are in cents
function fmtCents(cents: number) {
    return `RM ${(cents / 100).toFixed(2)}`;
}

function fmtDate(date: string) {
    return new Date(date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Pre-fill context from rental (renders nothing) ────────────────────────────

function PreFillFromRental({ rental }: { rental: Rental }) {
    const { setStartDate, setEndDate } = useEquipmentRentalContext();
    useEffect(() => {
        setStartDate(rental.requestedStartDate);
        setEndDate(rental.requestedEndDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rental.id]);
    return null;
}

// ── Step 1: Pick Dates ────────────────────────────────────────────────────────

function Step1Content({ onNext }: { onNext: () => void }) {
    const { startDate, endDate, setStartDate, setEndDate } = useEquipmentRentalContext();
    const canAdvance = !!startDate && !!endDate;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
                <CalendarDays className="h-5 w-5" />
                <h2 className="font-semibold">Select your rental period</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md">
                <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Pick start date"
                    />
                </div>
                <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Pick end date"
                        disabled={!startDate}
                    />
                </div>
            </div>
            {canAdvance ? (
                <p className="text-xs text-muted-foreground">
                    Rental period:{' '}
                    <span className="font-medium text-foreground">
                        {new Date(startDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {' '}–{' '}
                    <span className="font-medium text-foreground">
                        {new Date(endDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                </p>
            ) : (
                <p className="text-xs text-muted-foreground">Pick both dates to continue.</p>
            )}
            <Button onClick={onNext} disabled={!canAdvance} size="sm">
                Next
            </Button>
        </div>
    );
}

// ── Step 2: Add Equipment ─────────────────────────────────────────────────────

function CartSummary({
    onNext,
    onBack,
    onRentalCreated,
}: {
    onNext: () => void;
    onBack: () => void;
    onRentalCreated: (rental: Rental) => void;
}) {
    const { cartIds, notes, setNotes, startDate, endDate } = useEquipmentRentalContext();
    const { data: allEquipment } = useRentableEquipment();
    const { mutate, isPending, error } = useCreateRental();

    const days = startDate && endDate ? rentalDays(startDate, endDate) : 0;

    const cartItems = (allEquipment ?? []).filter((e) => cartIds.includes(e.mainEquipmentId));
    const lineItems = cartItems.map((e) => ({
        id: e.mainEquipmentId,
        label: `${e.brand} ${e.model}`,
        type: e.equipmentType,
        amount: days > 0 ? itemPrice(e.rate1Day, e.rate3Days, e.ratePerDayExtra, days) : 0,
    }));
    const total = lineItems.reduce((sum, i) => sum + i.amount, 0);

    const handleProceed = () => {
        if (!startDate || !endDate || cartIds.length === 0) return;
        mutate(
            { equipmentIds: cartIds, startDate, endDate, notes },
            { onSuccess: (data) => { onRentalCreated(data); onNext(); } },
        );
    };

    return (
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                    {cartIds.length} item{cartIds.length !== 1 ? 's' : ''} in cart
                </span>
                {days > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                        {days} day{days !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {lineItems.length > 0 && (
                <div className="rounded-md border bg-background text-sm divide-y">
                    {lineItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-3 py-2 gap-2">
                            <div>
                                <span className="font-medium">{item.label}</span>
                                <span className="text-muted-foreground text-xs ml-1.5">({item.type})</span>
                            </div>
                            <span className="font-mono text-xs shrink-0">{fmtRM(item.amount)}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between px-3 py-2 font-semibold">
                        <span>Estimated Total</span>
                        <span className="font-mono text-sm text-primary">{fmtRM(total)}</span>
                    </div>
                </div>
            )}

            <div className="max-w-sm space-y-1">
                <Label htmlFor="notes" className="text-xs">Notes</Label>
                <Input
                    id="notes"
                    placeholder="Purpose / remarks..."
                    value={notes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                />
            </div>

            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{error.message}</AlertDescription>
                </Alert>
            )}
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onBack} disabled={isPending}>
                    Cancel
                </Button>
                <Button size="sm" onClick={handleProceed} disabled={isPending || cartIds.length === 0}>
                    {isPending ? 'Submitting…' : 'Submit Rental Request'}
                </Button>
            </div>
        </div>
    );
}

function Step2Content({
    onNext,
    onBack,
    onRentalCreated,
}: {
    onNext: () => void;
    onBack: () => void;
    onRentalCreated: (rental: Rental) => void;
}) {
    const { data, isLoading, isError, error, refetch } = useRentableEquipment();
    const cameras = (data ?? []).filter((e) => e.equipmentType === 'Camera');
    const lenses  = (data ?? []).filter((e) => e.equipmentType === 'Lens');

    return (
        <div className="space-y-4">
            <CartSummary onNext={onNext} onBack={onBack} onRentalCreated={onRentalCreated} />
            <DataTable
                columns={rentableEquipmentColumns}
                data={cameras}
                isLoading={isLoading}
                isError={isError}
                error={error ?? undefined}
                onRetry={() => void refetch()}
                title="Cameras"
                totalElements={cameras.length}
                emptyMessage="No cameras available."
            />
            <DataTable
                columns={rentableEquipmentColumns}
                data={lenses}
                isLoading={isLoading}
                isError={isError}
                error={error ?? undefined}
                onRetry={() => void refetch()}
                title="Lenses"
                totalElements={lenses.length}
                emptyMessage="No lenses available."
            />
        </div>
    );
}

// ── Step 3: Payment ───────────────────────────────────────────────────────────

function Step3Content({
    rental,
    onNext,
    onBack,
}: {
    rental: Rental | null;
    onNext: () => void;
    onBack: () => void;
}) {
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');
    const { mutate, isPending, error } = usePayRental();

    const handlePay = () => {
        if (!rental) return;
        mutate(
            { id: rental.id, paymentMethod },
            {
                onSuccess: (data) => {
                    if (data.billUrl) {
                        window.open(data.billUrl, '_blank');
                    }
                    onNext();
                },
            },
        );
    };

    return (
        <div className="space-y-5">
            {/* Rental summary */}
            {rental && (
                <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary">
                        <Receipt className="h-4 w-4" />
                        <span>Rental Summary</span>
                        <span className="ml-auto font-mono text-xs text-muted-foreground">{rental.rentalNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span>{fmtDate(rental.requestedStartDate)} – {fmtDate(rental.requestedEndDate)}</span>
                    </div>
                    <div className="rounded-md border bg-background text-sm divide-y">
                        {rental.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-3 py-2 gap-2">
                                <div>
                                    <span className="font-medium">{item.brand} {item.model}</span>
                                    <span className="text-xs text-muted-foreground ml-1.5">({item.equipmentType})</span>
                                </div>
                                <span className="font-mono text-xs shrink-0">{fmtCents(item.itemTotalAmount)}</span>
                            </div>
                        ))}
                        <div className="flex items-center justify-between px-3 py-2 font-semibold">
                            <span>Total</span>
                            <span className="font-mono text-sm text-primary">{fmtCents(rental.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment method selector */}
            <div className="space-y-2">
                <Label className="text-xs">Payment Method</Label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('ONLINE')}
                        className={cn(
                            'rounded-lg border-2 p-4 text-left space-y-1 transition-colors',
                            paymentMethod === 'ONLINE'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40',
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            <span className="font-semibold text-sm">Online</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Pay via Billplz</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={cn(
                            'rounded-lg border-2 p-4 text-left space-y-1 transition-colors',
                            paymentMethod === 'CASH'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40',
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            <span className="font-semibold text-sm">Cash</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Pay in person</p>
                    </button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{error.message}</AlertDescription>
                </Alert>
            )}

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onBack} disabled={isPending}>
                    Cancel
                </Button>
                <Button size="sm" onClick={handlePay} disabled={isPending || !rental}>
                    {isPending
                        ? 'Processing…'
                        : 'Pay Now'}
                </Button>
            </div>
        </div>
    );
}

// ── Step 4: Receipt ───────────────────────────────────────────────────────────

function Step4Content({ rentalNumber, isGenerating, onBack }: { rentalNumber: string | null; isGenerating?: boolean; onBack: () => void }) {
    return (
        <div className="space-y-4">
            {rentalNumber
                ? <ReceiptView rentalNumber={rentalNumber} isGenerating={isGenerating} />
                : (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                        <Receipt className="h-10 w-10 opacity-40" />
                        <p className="text-sm">No rental linked to this receipt.</p>
                    </div>
                )
            }
            <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
        </div>
    );
}

// ── RentStepper ───────────────────────────────────────────────────────────────

export function RentStepper() {
    const location = useLocation();
    const state = location.state as { rental?: Rental; goToReceipt?: boolean } | null;
    const prefilledRental = state?.rental ?? null;
    const goToReceipt = state?.goToReceipt ?? false;

    const [searchParams] = useSearchParams();
    // Captured once on mount so they survive the URL cleanup in handleDialogClose
    const [rentalNumberFromUrl] = useState(() => searchParams.get('rentalNumber'));
    const [fromBillplzRedirect] = useState(
        () => searchParams.get('billplz[paid]') === 'true' && !!searchParams.get('rentalNumber')
    );

    const [currentStep, setCurrentStep] = useState<StepId>(
        fromBillplzRedirect || goToReceipt ? 4 : prefilledRental ? 3 : 1
    );
    const [rental, setRental] = useState<Rental | null>(prefilledRental);

    const goTo = (step: StepId) => setCurrentStep(step);

    return (
        <Stepper
            value={currentStep}
            onValueChange={(v) => setCurrentStep(v as StepId)}
            indicators={{
                completed: <Check className="size-3.5" />,
                loading: <LoaderCircle className="size-3.5 animate-spin" />,
            }}
            className="w-full space-y-6"
        >
            {/* Pre-fill context dates when coming from Pay Now */}
            {prefilledRental && <PreFillFromRental rental={prefilledRental} />}

            {/* Step navigation */}
            <Card className="shadow-sm">
                <CardContent className="pt-6 pb-5 px-6">
                    <StepperNav className="gap-3">
                        {STEPS.map((step) => (
                            <StepperItem
                                key={step.id}
                                step={step.id}
                                disabled={step.id > currentStep}
                                className="relative flex-1 items-start"
                            >
                                <StepperTrigger
                                    className="flex grow flex-col items-start justify-center gap-2.5"
                                    asChild
                                >
                                    <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=inactive]:bg-transparent size-8 border-2">
                                        {step.icon}
                                    </StepperIndicator>
                                    <div className="flex flex-col items-start gap-1">
                                        <div className="text-muted-foreground text-[10px] font-semibold uppercase">
                                            Step {step.id}
                                        </div>
                                        <StepperTitle className="group-data-[state=inactive]/step:text-muted-foreground text-start text-sm font-semibold">
                                            {step.label}
                                        </StepperTitle>
                                        <div>
                                            <Badge
                                                size="sm"
                                                variant="primary-light"
                                                className="hidden group-data-[state=active]/step:inline-flex"
                                            >
                                                In Progress
                                            </Badge>
                                            <Badge
                                                size="sm"
                                                variant="success-light"
                                                className="hidden group-data-[state=completed]/step:inline-flex"
                                            >
                                                Completed
                                            </Badge>
                                            <Badge
                                                size="sm"
                                                variant="secondary"
                                                className="text-muted-foreground hidden group-data-[state=inactive]/step:inline-flex"
                                            >
                                                Pending
                                            </Badge>
                                        </div>
                                    </div>
                                </StepperTrigger>

                                {step.id < STEPS.length && (
                                    <StepperSeparator className="absolute inset-x-0 inset-s-9 top-4 m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none group-data-[state=completed]/step:bg-primary" />
                                )}
                            </StepperItem>
                        ))}
                    </StepperNav>
                </CardContent>
            </Card>

            {/* Step content */}
            <StepperPanel>
                <Card className="shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="text-base">
                            {STEPS.find((s) => s.id === currentStep)?.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <StepperContent value={1}>
                            <Step1Content onNext={() => goTo(2)} />
                        </StepperContent>
                        <StepperContent value={2}>
                            <Step2Content
                                onNext={() => goTo(3)}
                                onBack={() => goTo(1)}
                                onRentalCreated={setRental}
                            />
                        </StepperContent>
                        <StepperContent value={3}>
                            <Step3Content
                                rental={rental}
                                onNext={() => goTo(4)}
                                onBack={() => goTo(2)}
                            />
                        </StepperContent>
                        <StepperContent value={4}>
                            <Step4Content rentalNumber={rental?.rentalNumber ?? rentalNumberFromUrl} isGenerating={fromBillplzRedirect} onBack={() => goTo(3)} />
                        </StepperContent>
                    </CardContent>
                </Card>
            </StepperPanel>
        </Stepper>
    );
}
