import { PlusCircle, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';

import { RentalSuccessDialog } from './EquipmentRental/dialog-success-rent';
import { useRentalListContext } from './context';
import { RentalListProvider } from './provider';
import { rentalListColumns } from './table-column-def';

function RentalListContent() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { rentalSubmitted?: boolean; rentalNumber?: string } | null;

    const [successOpen, setSuccessOpen] = useState(state?.rentalSubmitted === true);
    const rentalNumber = state?.rentalNumber;

    const handleSuccessClose = () => {
        setSuccessOpen(false);
        navigate('/equipment-rent', { replace: true, state: null });
    };

    const { data, isLoading, isError, error, refetch } = useRentalListContext();

    return (
        <div className="space-y-4 p-2 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Receipt className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">My Rentals</h1>
                        <p className="text-sm text-muted-foreground">View your rental history and status.</p>
                    </div>
                </div>
                <Button size="sm" onClick={() => navigate('/equipment-rent/new')}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    New Rental
                </Button>
            </div>

            <DataTable
                columns={rentalListColumns}
                data={data ?? []}
                isLoading={isLoading}
                isError={isError}
                error={error ?? undefined}
                onRetry={() => void refetch()}
                title="Rental History"
                totalElements={data?.length}
                emptyMessage="No rentals found."
            />

            <RentalSuccessDialog
                open={successOpen}
                onOpenChange={(open) => { if (!open) handleSuccessClose(); }}
                rentalNumber={rentalNumber}
            />
        </div>
    );
}

export default function RentalListPage() {
    return (
        <RentalListProvider>
            <RentalListContent />
        </RentalListProvider>
    );
}
