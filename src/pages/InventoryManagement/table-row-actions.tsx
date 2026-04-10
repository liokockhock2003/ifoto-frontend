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
import type { MainEquipment, SubEquipment } from '@/store/schemas/equipment';

import { MainEquipmentDeleteDialog, SubEquipmentDeleteDialog } from './dialog-delete';
import { MainEquipmentEditDialog, SubEquipmentEditDialog } from './dialog-edit';

// ── Main Equipment ────────────────────────────────────────────────────────────

type MainEquipmentRowActionsProps = {
    row: Row<MainEquipment>;
};

export function MainEquipmentRowActions({ row }: MainEquipmentRowActionsProps) {
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

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

            <MainEquipmentEditDialog
                open={openEdit}
                onOpenChange={setOpenEdit}
                equipment={row.original}
            />
            <MainEquipmentDeleteDialog
                open={openDelete}
                onOpenChange={setOpenDelete}
                equipment={row.original}
            />
        </>
    );
}

// ── Sub Equipment ─────────────────────────────────────────────────────────────

type SubEquipmentRowActionsProps = {
    row: Row<SubEquipment>;
};

export function SubEquipmentRowActions({ row }: SubEquipmentRowActionsProps) {
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

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

            <SubEquipmentEditDialog
                open={openEdit}
                onOpenChange={setOpenEdit}
                equipment={row.original}
            />
            <SubEquipmentDeleteDialog
                open={openDelete}
                onOpenChange={setOpenDelete}
                equipment={row.original}
            />
        </>
    );
}
