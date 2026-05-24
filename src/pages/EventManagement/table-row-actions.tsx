import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Row } from '@tanstack/react-table';
import { ClipboardList, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Event } from '@/store/schemas/event';

import { useEventManagementContext } from './context';
import { EventDeleteDialog } from './dialog-delete';
import { EventEditDialog } from './dialog-edit';

type EventRowActionsProps = {
    row: Row<Event>;
};

export function EventRowActions({ row }: EventRowActionsProps) {
    const { isEventCommittee } = useEventManagementContext();
    const navigate = useNavigate();
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    if (isEventCommittee) {
        return (
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void navigate(`/equipment-requests/${row.original.eventId}`)}
            >
                <ClipboardList className="mr-2 h-4 w-4" />
                Request Equipment
            </Button>
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setOpenEdit(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setOpenDelete(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EventEditDialog open={openEdit} onOpenChange={setOpenEdit} event={row.original} />
            <EventDeleteDialog open={openDelete} onOpenChange={setOpenDelete} event={row.original} />
        </>
    );
}
