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
import { useReviewRequest } from '@/store/queries/request';
import type { EquipmentRequest } from '@/store/schemas/request';

import { useRequestManagementContext } from './context';

type RequestReviewDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: EquipmentRequest | null;
};

export function RequestReviewDialog({ open, onOpenChange, request }: RequestReviewDialogProps) {
    const reviewMutation = useReviewRequest();
    const { setReviewRequest, availableEquipment, availableSubEquipment, isAvailableEquipmentLoading } = useRequestManagementContext();

    const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
    const [approveNotes, setApproveNotes] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');

    useEffect(() => {
        if (open) {
            setEquipmentIds(request?.items.map((i) => i.mainEquipmentId) ?? []);
            setReviewRequest(request ?? null);
        } else {
            setEquipmentIds([]);
            setApproveNotes('');
            setRejectNotes('');
            setReviewRequest(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function handleOpenChange(next: boolean) {
        onOpenChange(next);
    }

    async function handleApprove() {
        if (!request) return;
        try {
            await reviewMutation.mutateAsync({
                id: request.id,
                action: 'APPROVE',
                equipmentIds,
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg text-muted-foreground">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        Review Request{request ? ` — ${request.requestNumber}` : ''}
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
                            requestedItems={request?.items ?? []}
                            requestedSubItems={request?.subItems ?? []}
                            availableEquipment={availableEquipment}
                            availableSubEquipment={availableSubEquipment}
                            isLoading={isAvailableEquipmentLoading}
                        />
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <Textarea
                                value={approveNotes}
                                onChange={(e) => setApproveNotes(e.target.value)}
                                placeholder="Optional notes for the requester"
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
                                {isPending ? 'Approving...' : 'Approve Request'}
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    {/* ── Reject tab ── */}
                    <TabsContent value="reject" className="space-y-3 pt-2">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-foreground">Committee Notes</label>
                            <Textarea
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                                placeholder="Reason for rejection (optional)"
                                rows={4}
                                className="resize-none"
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
