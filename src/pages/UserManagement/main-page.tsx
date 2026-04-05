import { useEffect, useRef, useState } from 'react';
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFilteredRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { AlertCircle, ChevronLeft, ChevronRight, Search, SearchX, UserCog } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useUserManagementContext } from './context';
import { UserManagementProvider } from './provider';
import { userTableColumns } from './table-column-def';

function SearchInput() {
    const { filters, setSearch } = useUserManagementContext();
    const [value, setValue] = useState(filters.search ?? '');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const next = e.target.value;
        setValue(next);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(next || undefined);
        }, 300);
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search users..."
                value={value}
                onChange={handleChange}
                className="w-full pl-9 rounded-4xl sm:w-64"
            />
        </div>
    );
}

function SkeletonRows() {
    return (
        <>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    {userTableColumns.map((_, j) => (
                        <TableCell key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

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

    const currentPage = filters.page + 1;
    const maxPages = Math.max(totalPages, 1);

    const renderBody = () => {
        if (isLoading) return <SkeletonRows />;

        if (table.getRowModel().rows.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={userTableColumns.length} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <SearchX className="h-8 w-8 opacity-40" />
                            <p className="text-sm">No users found.</p>
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        return table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="transition-colors hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        ));
    };

    return (
        <div className="space-y-4 p-2 sm:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <UserCog className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl text-primary font-semibold tracking-tight">User Management</h1>
                    <p className="text-sm text-muted-foreground">Manage accounts, roles, and access.</p>
                </div>
            </div>

            {isError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>Failed to load users: {error?.message ?? 'Unknown error'}</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <Card className="shadow-sm">
                <CardHeader className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div>
                        <CardTitle className="text-base">All Users</CardTitle>
                        <CardDescription>
                            {isLoading ? 'Loading...' : `${totalElements} user${totalElements !== 1 ? 's' : ''} total`}
                        </CardDescription>
                    </div>
                    <SearchInput />
                </CardHeader>

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {renderBody()}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
                    <span className="font-medium text-foreground">{maxPages}</span>
                </p>
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => setPage(filters.page - 1)}
                        disabled={filters.page <= 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => setPage(filters.page + 1)}
                        disabled={filters.page + 1 >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function UserManagementMainPage() {
    return (
        <UserManagementProvider>
            <UserManagementTable />
        </UserManagementProvider>
    );
}
