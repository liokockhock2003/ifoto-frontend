import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { EquipmentSelect } from '@/components/equipment-select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import { useReviewRental } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

import { useBookingManagementContext } from './context';

type BookingReviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function BookingReviewDialog({ open, onOpenChange, rental }: BookingReviewDialogProps) {
    const reviewMutation = useReviewRental();
    const { setReviewRental, availableEquipment, availableSubEquipment, isAvailableEquipmentLoading } = useBookingManagementContext();

    const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');

    useEffect(() => {
        if (open) {
            setEquipmentIds(rental?.items.map((i) => i.mainEquipmentId) ?? []);
            setReviewRental(rental ?? null);
        } else {
            setEquipmentIds([]);
            setApproveNotes('');
            setRejectionReason('');
            setRejectNotes('');
            setReviewRental(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function handleOpenChange(next: boolean) {
        onOpenChange(next);
    }

    async function handleApprove() {
        if (!rental) return;
        try {
            await reviewMutation.mutateAsync({
                id: rental.id,
                action: 'APPROVE',
                equipmentIds,
                ...(approveNotes ? { committeeNotes: approveNotes } : {}),
            });
            toast.success(`Rental ${rental.rentalNumber} approved`);
            handleOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to approve rental');
        }
    }

    async function handleReject() {
        if (!rental) return;
        try {
            await reviewMutation.mutateAsync({
                id: rental.id,
                action: 'REJECT',
                rejectionReason,
                ...(rejectNotes ? { committeeNotes: rejectNotes } : {}),
            });
            toast.success(`Rental ${rental.rentalNumber} rejected`);
            handleOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reject rental');
        }
    }

    const isPending = reviewMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Review Rental{rental ? ` — ${rental.rentalNumber}` : ''}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="approve">
                    <PrimaryTabsList className="w-full">
                        <PrimaryTabsTrigger value="approve" className="flex-1">Approve</PrimaryTabsTrigger>
                        <PrimaryTabsTrigger value="reject" className="flex-1">Reject</PrimaryTabsTrigger>
                    </PrimaryTabsList>

                    {/* ── Approve tab ── */}
                    <TabsContent value="approve" className="space-y-3 pt-2">
                        <EquipmentSelect
                            value={equipmentIds}
                            onChange={setEquipmentIds}
                            requestedItems={rental?.items ?? []}
                            requestedSubItems={rental?.subItems ?? []}
                            availableEquipment={availableEquipment}
                            availableSubEquipment={availableSubEquipment}
                            isLoading={isAvailableEquipmentLoading}
                        />
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <Textarea
                                value={approveNotes}
                                onChange={(e) => setApproveNotes(e.target.value)}
                                placeholder="Optional notes for internal reference"
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="text-muted-foreground" disabled={isPending} onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={equipmentIds.length === 0 || isPending}
                                onClick={() => void handleApprove()}
                            >
                                {isPending ? 'Approving...' : 'Approve Rental'}
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    {/* ── Reject tab ── */}
                    <TabsContent value="reject" className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Rejection Reason *</label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why the rental is being rejected"
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <Textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Optional notes for internal reference"
                                rows={2}
                                className="resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="text-muted-foreground" disabled={isPending} onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={!rejectionReason.trim() || isPending}
                                onClick={() => void handleReject()}
                            >
                                {isPending ? 'Rejecting...' : 'Reject Rental'}
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
