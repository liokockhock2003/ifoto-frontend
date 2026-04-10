import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

import { Badge } from '@/components/ui/badge';
import { getRoleLabel } from '@/constants/roles';
import type { User } from '@/store/schemas/user';

import { UserTableRowActions } from './table-row-actions';

const columnHelper = createColumnHelper<User>();

export const userTableColumns: ColumnDef<User, any>[] = [
    columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('fullName', {
        header: 'Full Name',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('username', {
        header: 'Username',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.roles, {
        id: 'roles',
        header: 'Roles',
        cell: (info) => {
            const roles: string[] = info.getValue();
            if (!roles?.length) return <span className="text-muted-foreground">-</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {roles.map((role) => (
                        <Badge key={role} variant="secondary">
                            {getRoleLabel(role)}
                        </Badge>
                    ))}
                </div>
            );
        },
    }),
    columnHelper.accessor('isLocked', {
        header: 'Status',
        cell: (info) => {
            const isLocked = info.getValue();
            return isLocked ? (
                <Badge variant="outline" className="badge-danger">Inactive</Badge>
            ) : (
                <Badge variant="outline" className="badge-success">Active</Badge>
            );
        },
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <UserTableRowActions row={row} />,
    }),
];
