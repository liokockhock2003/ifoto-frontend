import { useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/store/schemas/user';

import { UserDeleteDialog } from './dialog-delete';
import { UserEditDialog } from './dialog-edit';

type UserTableRowActionsProps = {
    row: Row<User>;
};

export function UserTableRowActions({ row }: UserTableRowActionsProps) {
    const disabled = !row.original.isActive;
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

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
                    <DropdownMenuItem onClick={() => setOpenEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        disabled={disabled}
                        onClick={() => setOpenDeleteDialog(true)}
                        className="text-destructive focus:text-destructive"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <UserEditDialog
                open={openEditDialog}
                onOpenChange={setOpenEditDialog}
                user={row.original}
            />

            <UserDeleteDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
                user={row.original}
            />
        </>
    );
}
