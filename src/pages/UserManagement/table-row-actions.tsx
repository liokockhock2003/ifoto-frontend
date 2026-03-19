import { useState } from 'react';
import type { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
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
            <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline">
                    View
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setOpenEditDialog(true)}>
                    Edit
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={disabled}
                    onClick={() => setOpenDeleteDialog(true)}
                >
                    Delete
                </Button>
            </div>

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
