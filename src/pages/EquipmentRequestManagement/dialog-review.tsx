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
import { useReviewRequest } from '@/store/queries/request';
import type { EquipmentRequest } from '@/store/schemas/request';

type RequestReviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

export function RequestReviewDialog({ open, onOpenChange, request }: RequestReviewDialogProps) {
    const reviewMutation = useReviewRequest();

    const [approvedStartDate, setApprovedStartDate] = useState('');
    const [approvedEndDate, setApprovedEndDate] = useState('');
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');

    function resetForm() {
        setApprovedStartDate('');
        setApprovedEndDate('');
        setApproveNotes('');
        setRejectNotes('');
    }

    function handleOpenChange(next: boolean) {
        if (!next) resetForm();
        onOpenChange(next);
    }

    async function handleApprove() {
        if (!request) return;
        try {
            await reviewMutation.mutateAsync({
                id: request.id,
                action: 'APPROVE',
                approvedStartDate,
                approvedEndDate,
                equipmentIds: request.items.map((i) => i.mainEquipmentId),
                subEquipmentEntries: request.subItems.length > 0
                    ? request.subItems.map((i) => ({ subEquipmentId: i.subEquipmentId, quantity: i.quantity }))
                    : undefined,
                ...(approveNotes ? { committeeNotes: approveNotes } : {}),
            });
            toast.success(`Request ${request.requestNumber} approved`);
            handleOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to approve request');
        }
    }

    async function handleReject() {
        if (!request) return;
        try {
            await reviewMutation.mutateAsync({
                id: request.id,
                action: 'REJECT',
                ...(rejectNotes ? { committeeNotes: rejectNotes } : {}),
            });
            toast.success(`Request ${request.requestNumber} rejected`);
            handleOpenChange(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Failed to reject request');
        }
    }

    const isPending = reviewMutation.isPending;
    const dateRangeInvalid = !!approvedStartDate && !!approvedEndDate && approvedEndDate < approvedStartDate;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        Review Request{request ? ` — ${request.requestNumber}` : ''}
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
                                className={`w-full h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring ${dateRangeInvalid ? 'border-destructive focus:ring-destructive' : 'border-input'}`}
                            />
                            {dateRangeInvalid && (
                                <p className="text-xs text-destructive">End date must be on or after the start date.</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <textarea
                                value={approveNotes}
                                onChange={(e) => setApproveNotes(e.target.value)}
                                placeholder="Optional notes for the requester"
                                rows={3}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="text-muted-foreground" disabled={isPending} onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                disabled={!approvedStartDate || !approvedEndDate || dateRangeInvalid || isPending}
                                onClick={() => void handleApprove()}
                            >
                                {isPending ? 'Approving...' : 'Approve Request'}
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    {/* ── Reject tab ── */}
                    <TabsContent value="reject" className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Reason for rejection (optional)"
                                rows={4}
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="text-muted-foreground" disabled={isPending} onClick={() => handleOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                disabled={isPending}
                                onClick={() => void handleReject()}
                            >
                                {isPending ? 'Rejecting...' : 'Reject Request'}
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
