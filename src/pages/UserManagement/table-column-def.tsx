import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';

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
    columnHelper.accessor((row) => row.roles.join(', '), {
        id: 'roles',
        header: 'Roles',
        cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('isLocked', {
        header: 'Status',
        cell: (info) => (info.getValue() ? 'Locked' : 'Unlocked'),
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <UserTableRowActions row={row} />,
    }),
];
