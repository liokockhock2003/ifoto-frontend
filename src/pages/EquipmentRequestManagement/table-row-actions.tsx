import { useState } from 'react';
import { CheckSquare, Eye, PackageCheck } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import type { EquipmentRequest } from '@/store/schemas/request';
import { EquipmentRequestViewDialog } from '@/pages/EventManagement/EquipmentRequestList/dialog-view';

import { RequestReviewDialog } from './dialog-review';
import { RequestMarkReturnedDialog } from './dialog-mark-returned';

type RequestRowActionsProps = {
    row: Row<EquipmentRequest>;
};

export function RequestRowActions({ row }: RequestRowActionsProps) {
    const [viewOpen, setViewOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [markReturnedOpen, setMarkReturnedOpen] = useState(false);

    const request = row.original;

    const showReview = request.status === 'PENDING_REVIEW';
    const showMarkReturned = request.status === 'ACTIVE';

    return (
        <>
            <div className="flex items-center gap-1">
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => setViewOpen(true)}
                >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View request details</span>
                </Button>

                {showReview && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => setReviewOpen(true)}
                    >
                        <CheckSquare className="h-4 w-4" />
                        <span className="sr-only">Review request</span>
                    </Button>
                )}

                {showMarkReturned && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-muted-foreground"
                        onClick={() => setMarkReturnedOpen(true)}
                    >
                        <PackageCheck className="h-3.5 w-3.5" />
                        Mark Returned
                    </Button>
                )}
            </div>

            <EquipmentRequestViewDialog open={viewOpen} onOpenChange={setViewOpen} request={request} />
            <RequestReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} request={request} />
            <RequestMarkReturnedDialog open={markReturnedOpen} onOpenChange={setMarkReturnedOpen} request={request} />
        </>
    );
}
