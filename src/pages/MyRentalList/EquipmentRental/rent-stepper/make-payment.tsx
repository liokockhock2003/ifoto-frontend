import { Banknote, CreditCard, Building2, X } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from '@/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePayRental } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';
import { RentalDeleteDialog } from '@/pages/MyRentalList/dialog-delete';

import { GeneratedInvoice } from './generated-invoice';

export function MakePayment({
    rental,
    onNext,
}: {
    rental: Rental | null;
    onNext: () => void;
}) {
    const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH' | 'BANK_TRANSFER'>('ONLINE');
    const [cancelOpen, setCancelOpen] = useState(false);
    const { mutate, isPending, error } = usePayRental();
    const canCancel = rental?.status === 'PENDING_REVIEW' || rental?.status === 'APPROVED';
    const showPaymentMethod =
        rental?.status === 'PICKED_UP' ||
        rental?.status === 'PENDING_PAYMENT' ||
        (rental?.status === 'RETURNED' && (rental.totalPenaltyAmount ?? 0) > 0 && rental.paymentStatus !== 'PENALTY_PAID');

    const handlePay = () => {
        if (!rental) return;
        mutate(
            { id: rental.id, paymentMethod },
            {
                onSuccess: (data) => {
                    if (data.billUrl) {
                        sessionStorage.setItem('billplz_rentalId', String(rental.id));
                        window.open(data.billUrl, '_blank');
                    }
                    onNext();
                },
            },
        );
    };

    return (
        <div className="space-y-5">
            <GeneratedInvoice rentalId={rental?.id ?? null} />

            {showPaymentMethod && (
                <>
                    <div className="space-y-2">
                        <p className="text-xs font-medium">Payment Method</p>
                        <RadioGroup
                            value={paymentMethod}
                            onValueChange={(v) => setPaymentMethod(v as 'ONLINE' | 'CASH' | 'BANK_TRANSFER')}
                            className="grid grid-cols-3 gap-3 max-w-lg"
                        >
                            <FieldLabel className="cursor-pointer transition-colors">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>
                                            <CreditCard className="h-4 w-4" />
                                            Online
                                        </FieldTitle>
                                        <FieldDescription>Pay via Billplz</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="ONLINE" />
                                </Field>
                            </FieldLabel>
                            <FieldLabel className="cursor-pointer transition-colors">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>
                                            <Banknote className="h-4 w-4" />
                                            Cash
                                        </FieldTitle>
                                        <FieldDescription>Pay in person</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="CASH" />
                                </Field>
                            </FieldLabel>
                            <FieldLabel className="cursor-pointer transition-colors">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>
                                            <Building2 className="h-4 w-4" />
                                            Bank Transfer
                                        </FieldTitle>
                                        <FieldDescription>Transfer to committee account</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="BANK_TRANSFER" />
                                </Field>
                            </FieldLabel>
                        </RadioGroup>
                        {paymentMethod === 'BANK_TRANSFER' && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Transfer the amount shown on your invoice to the committee's bank account, then wait for confirmation.
                            </p>
                        )}
                    </div>

                    {error && (
                        <Alert variant="destructive" className="py-2">
                            <AlertDescription className="text-xs">{error.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-2">
                        {canCancel && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => setCancelOpen(true)}
                                disabled={isPending}
                            >
                                <X className="h-4 w-4" />
                                Cancel Rental
                            </Button>
                        )}
                        <Button size="sm" onClick={handlePay} disabled={isPending || !rental}>
                            {isPending ? 'Processing…' : 'Pay Now'}
                        </Button>
                    </div>
                </>
            )}

            <RentalDeleteDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                rental={rental}
            />
        </div>
    );
}
