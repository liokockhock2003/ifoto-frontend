import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReviewRental } from '@/store/queries/rental';
import type { Rental } from '@/store/schemas/rental';

type BookingReviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental | null;
};

export function BookingReviewDialog({ open, onOpenChange, rental }: BookingReviewDialogProps) {
    const reviewMutation = useReviewRental();

    const [approvedStartDate, setApprovedStartDate] = useState('');
    const [approvedEndDate, setApprovedEndDate] = useState('');
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');

    function resetForm() {
        setApprovedStartDate('');
        setApprovedEndDate('');
        setApproveNotes('');
        setRejectionReason('');
        setRejectNotes('');
    }

    function handleOpenChange(next: boolean) {
        if (!next) resetForm();
        onOpenChange(next);
    }

    async function handleApprove() {
        if (!rental) return;
        try {
            await reviewMutation.mutateAsync({
                id: rental.id,
                action: 'APPROVE',
                approvedStartDate,
                approvedEndDate,
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
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Review Rental{rental ? ` — ${rental.rentalNumber}` : ''}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="approve">
                    <TabsList className="w-full">
                        <TabsTrigger value="approve" className="flex-1">Approve</TabsTrigger>
                        <TabsTrigger value="reject" className="flex-1">Reject</TabsTrigger>
                    </TabsList>

                    {/* ── Approve tab ── */}
                    <TabsContent value="approve" className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Approved Start Date *</label>
                            <input
                                type="date"
                                value={approvedStartDate}
                                onChange={(e) => setApprovedStartDate(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Approved End Date *</label>
                            <input
                                type="date"
                                value={approvedEndDate}
                                onChange={(e) => setApprovedEndDate(e.target.value)}
                                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <textarea
                                value={approveNotes}
                                onChange={(e) => setApproveNotes(e.target.value)}
                                placeholder="Optional notes for internal reference"
                                rows={3}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="text-muted-foreground" disabled={isPending} onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!approvedStartDate || !approvedEndDate || isPending}
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
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Explain why the rental is being rejected"
                                rows={3}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Optional notes for internal reference"
                                rows={2}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
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
