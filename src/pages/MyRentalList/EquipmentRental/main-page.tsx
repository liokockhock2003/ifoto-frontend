import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';

import { PaymentResultDialog } from './dialog-payment';
import { EquipmentRentalProvider } from './provider';
import { RentStepper } from './rent-stepper';

function EquipmentRentalPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const billplzPaid = searchParams.get('billplz[paid]');
    const billId = searchParams.get('billplz[id]');
    const paymentStatus = billplzPaid === 'true' ? 'success' : billplzPaid === 'false' ? 'failed' : null;
    const [dialogOpen, setDialogOpen] = useState(!!paymentStatus);

    const handleDialogClose = () => {
        setDialogOpen(false);
        navigate('/equipment-rent/new', { replace: true });
    };

    return (
        <div className="space-y-6 p-2 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={() => navigate('/equipment-rent')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">Equipment Rental</h1>
                        <p className="text-sm text-muted-foreground">Browse and request equipment for rent.</p>
                    </div>
                </div>
            </div>

            <RentStepper />

            <PaymentResultDialog
                status={dialogOpen ? paymentStatus : null}
                billId={billId}
                onClose={handleDialogClose}
            />
        </div>
    );
}

export default function EquipmentRentalMainPage() {
    return (
        <EquipmentRentalProvider>
            <EquipmentRentalPage />
        </EquipmentRentalProvider>
    );
}
