import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Eye, MoreHorizontal, PackageCheck, RefreshCw, Truck } from 'lucide-react';
import type { Row } from '@tanstack/react-table';

import { useAuth } from '@/store/auth-context';
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

import { RequestMarkReturnedDialog } from './dialog-mark-returned';
import { RequestMarkPickedUpDialog } from './dialog-mark-picked-up';

type RequestRowActionsProps = {
    row: Row<EquipmentRequest>;
};

export function RequestRowActions({ row }: RequestRowActionsProps) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [viewOpen, setViewOpen] = useState(false);
    const [markReturnedOpen, setMarkReturnedOpen] = useState(false);
    const [markPickedUpOpen, setMarkPickedUpOpen] = useState(false);

    const request = row.original;

    // Review & update happen on the calendar-driven logistics page (mode derived from status).
    const openLogistics = () =>
        navigate(`/event-equipment/calendar/${request.id}`, {
            state: { breadcrumbLabel: request.requestNumber },
        });

    const isApprover = request.reviewedByUsername === user?.username;
    const showReview = request.status === 'PENDING_REVIEW';
    const showMarkPickedUp = isApprover && request.status === 'APPROVED';
    const showUpdate = isApprover && (request.status === 'APPROVED' || request.status === 'ACTIVE');
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
                                onClick={openLogistics}
                            >
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Review Request
                            </DropdownMenuItem>
                        </>
                    )}

                    {showUpdate && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={openLogistics}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Update Request
                            </DropdownMenuItem>
                        </>
                    )}

                    {showMarkPickedUp && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-primary focus:text-primary"
                                onClick={() => setMarkPickedUpOpen(true)}
                            >
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Picked Up
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
            <RequestMarkReturnedDialog open={markReturnedOpen} onOpenChange={setMarkReturnedOpen} request={request} />
            <RequestMarkPickedUpDialog open={markPickedUpOpen} onOpenChange={setMarkPickedUpOpen} request={request} />
        </>
    );
}
