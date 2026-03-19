import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useUserManagementContext } from './context';
import { UserManagementProvider } from './provider';
import { userTableColumns } from './table-column-def';

function UserManagementTable() {
    const {
        users,
        filters,
        totalElements,
        totalPages,
        isLoading,
        isError,
        error,
        setPage,
        refetch,
    } = useUserManagementContext();

    const table = useReactTable({
        data: users,
        columns: userTableColumns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
    });

    if (isLoading) {
        return <div className="p-4 text-sm text-muted-foreground">Loading users...</div>;
    }

    if (isError) {
        return (
            <div className="space-y-2 p-4">
                <p className="text-sm text-red-600">Failed to load users: {error?.message ?? 'Unknown error'}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="px-4 py-3 text-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-4 py-3 text-foreground">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell className="px-4 py-6 text-center text-muted-foreground" colSpan={userTableColumns.length}>
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                        Page {filters.page + 1} of {Math.max(totalPages, 1)} - {totalElements} users
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPage(filters.page - 1)}
                            disabled={filters.page <= 0}
                        >
                            Previous
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setPage(filters.page + 1)}
                            disabled={filters.page + 1 >= totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function UserManagementMainPage() {
    return (
        <UserManagementProvider>
            <UserManagementTable />
        </UserManagementProvider>
    );
}
