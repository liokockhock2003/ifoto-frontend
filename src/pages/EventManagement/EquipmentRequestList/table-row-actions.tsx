import { useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { Eye, MoreHorizontal, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EquipmentRequest } from '@/store/schemas/request';

import { EquipmentRequestCancelDialog } from './dialog-cancel';
import { EquipmentRequestViewDialog } from './dialog-view';

type EquipmentRequestRowActionsProps = {
    row: Row<EquipmentRequest>;
};

export function EquipmentRequestRowActions({ row }: EquipmentRequestRowActionsProps) {
    const [viewOpen, setViewOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    const request = row.original;

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

                    {request.status === 'PENDING_REVIEW' && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setCancelOpen(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Request
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <EquipmentRequestViewDialog
                open={viewOpen}
                onOpenChange={setViewOpen}
                request={request}
            />
            <EquipmentRequestCancelDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                request={request}
            />
        </>
    );
}
