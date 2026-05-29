import { useState } from 'react';
import { CheckSquare, Eye, MoreHorizontal, PackageCheck } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setViewOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>

                    {showReview && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-primary focus:text-primary"
                                onClick={() => setReviewOpen(true)}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Review Request
                            </DropdownMenuItem>
                        </>
                    )}

                    {showMarkReturned && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setMarkReturnedOpen(true)}>
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Mark Returned
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <EquipmentRequestViewDialog open={viewOpen} onOpenChange={setViewOpen} request={request} />
            <RequestReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} request={request} />
            <RequestMarkReturnedDialog open={markReturnedOpen} onOpenChange={setMarkReturnedOpen} request={request} />
        </>
    );
}
