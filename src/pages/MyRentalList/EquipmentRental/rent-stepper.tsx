import {
    CalendarDays,
    Check,
    CreditCard,
    LoaderCircle,
    Receipt,
    ShoppingCart,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Rental } from '@/store/schemas/rental';

import { useRentalEvents } from '@/hooks/use-rental-events';
import { useEquipmentRentalContext } from './context';
import { GeneratedReceipt } from './rent-stepper/generated-receipt';
import { MakePayment } from './rent-stepper/make-payment';
import { PickDateRange } from './rent-stepper/pick-date-range';
import { PickEquipments } from './rent-stepper/pick-equipments';

// ── Steps definition ──────────────────────────────────────────────────────────

const STEPS = [
    { id: 1, label: 'Pick Dates',    icon: <CalendarDays className="size-4" /> },
    { id: 2, label: 'Add Equipment', icon: <ShoppingCart  className="size-4" /> },
    { id: 3, label: 'Payment',       icon: <CreditCard    className="size-4" /> },
    { id: 4, label: 'Receipt',       icon: <Receipt       className="size-4" /> },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// ── Pre-fill context dates when navigating from Pay Now ───────────────────────

function PreFillFromRental({ rental }: { rental: Rental }) {
    const { setStartDate, setEndDate } = useEquipmentRentalContext();
    useEffect(() => {
        setStartDate(rental.programStartDate);
        setEndDate(rental.programEndDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rental.id]);
    return null;
}

// ── RentStepper ───────────────────────────────────────────────────────────────

export function RentStepper() {
    const location = useLocation();
    const state = location.state as { rental?: Rental; goToReceipt?: boolean } | null;
    const prefilledRental = state?.rental ?? null;
    const goToReceipt = state?.goToReceipt ?? false;

    const [searchParams] = useSearchParams();
    const [fromBillplzRedirect] = useState(
        () => searchParams.get('billplz[paid]') === 'true' && !!searchParams.get('rentalNumber')
    );
    const [rentalIdFromSession] = useState<number | null>(() => {
        if (searchParams.get('billplz[paid]') !== 'true') return null;
        const stored = sessionStorage.getItem('billplz_rentalId');
        if (stored) sessionStorage.removeItem('billplz_rentalId');
        return stored ? Number(stored) : null;
    });

    const [currentStep, setCurrentStep] = useState<StepId>(
        fromBillplzRedirect || goToReceipt ? 4 : prefilledRental ? 3 : 1
    );
    const [rental] = useState<Rental | null>(prefilledRental);

    const rentalId = rental?.id ?? rentalIdFromSession;
    const { isConnected: isSSEConnected } = useRentalEvents(rentalId);

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
                            <PickDateRange onNext={() => goTo(2)} />
                        </StepperContent>
                        <StepperContent value={2}>
                            <PickEquipments
                                onBack={() => goTo(1)}
                            />
                        </StepperContent>
                        <StepperContent value={3}>
                            <MakePayment
                                rental={rental}
                                onNext={() => goTo(4)}
                            />
                        </StepperContent>
                        <StepperContent value={4}>
                            <GeneratedReceipt
                                rentalId={rentalId}
                                isSSEConnected={isSSEConnected}
                                onBack={() => goTo(3)}
                            />
                        </StepperContent>
                    </CardContent>
                </Card>
            </StepperPanel>
        </Stepper>
    );
}
