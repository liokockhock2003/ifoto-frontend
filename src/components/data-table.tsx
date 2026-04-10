import { useState } from 'react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { AlertCircle, Search, SearchX } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    onRetry?: () => void;
    // Card header
    title?: string;
    totalElements?: number;
    headerActions?: React.ReactNode;
    // Server-side pagination (0-indexed). Omit to use client-side pagination.
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    // Empty state
    emptyMessage?: string;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    isError = false,
    error,
    onRetry,
    title,
    totalElements,
    headerActions,
    page = 0,
    totalPages = 1,
    onPageChange,
    emptyMessage = 'No results found.',
}: DataTableProps<TData, TValue>) {
    const useClientPagination = !onPageChange;
    const useBuiltinSearch = !headerActions;

    // Client-side pagination state (only used when onPageChange is not provided)
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Built-in column filter state (only used when headerActions is not provided)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const table = useReactTable({
        data,
        columns,
        state: {
            ...(useClientPagination && { pagination }),
            ...(useBuiltinSearch && { columnFilters, globalFilter }),
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        ...(useClientPagination && {
            getPaginationRowModel: getPaginationRowModel(),
            onPaginationChange: setPagination,
        }),
        ...(useBuiltinSearch && {
            onColumnFiltersChange: setColumnFilters,
            onGlobalFilterChange: setGlobalFilter,
            globalFilterFn: 'includesString',
        }),
    });

    const renderBody = () => {
        if (isLoading) {
            return Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    {columns.map((_, j) => (
                        <TableCell key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ));
        }

        if (table.getRowModel().rows.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <SearchX className="h-8 w-8 opacity-40" />
                            <p className="text-sm">{emptyMessage}</p>
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

    const descriptionText = isLoading
        ? 'Loading...'
        : totalElements !== undefined
            ? `${totalElements} ${totalElements !== 1 ? 'items' : 'item'} total`
            : undefined;

    // Pagination values — server-side vs client-side
    const clientPageIndex = table.getState().pagination.pageIndex;
    const clientPageCount = Math.max(table.getPageCount(), 1);
    const displayPage = useClientPagination ? clientPageIndex + 1 : page + 1;
    const displayTotal = useClientPagination ? clientPageCount : Math.max(totalPages, 1);

    const handlePrev = () => {
        if (useClientPagination) table.previousPage();
        else onPageChange?.(page - 1);
    };

    const handleNext = () => {
        if (useClientPagination) table.nextPage();
        else onPageChange?.(page + 1);
    };

    const prevDisabled = useClientPagination ? !table.getCanPreviousPage() : page <= 0;
    const nextDisabled = useClientPagination ? !table.getCanNextPage() : page + 1 >= totalPages;

    const showPagination = onPageChange || (useClientPagination && table.getPageCount() > 1);

    return (
        <div className="space-y-4">
            {isError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{error?.message ?? 'Unknown error'}</span>
                        {onRetry && (
                            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                                Retry
                            </Button>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <Card className="shadow-sm">
                {(title || headerActions || useBuiltinSearch) && (
                    <CardHeader className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        {title && (
                            <div>
                                <CardTitle className="text-base">{title}</CardTitle>
                                {descriptionText && (
                                    <CardDescription>{descriptionText}</CardDescription>
                                )}
                            </div>
                        )}

                        {/* Custom actions slot — or built-in global search */}
                        {headerActions ?? (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search..."
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    className="w-full pl-9 sm:w-64 rounded-4xl"
                                />
                            </div>
                        )}
                    </CardHeader>
                )}

                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>{renderBody()}</TableBody>
                    </Table>
                </CardContent>
            </Card>

            {showPagination && (
                <Pagination className='justify-end'>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (!prevDisabled) handlePrev(); }}
                                className={prevDisabled ? 'text-muted-foreground pointer-events-none opacity-50' : 'text-muted-foreground cursor-pointer'}
                                aria-disabled={prevDisabled}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="flex items-center px-2 text-sm text-muted-foreground">
                                Page{' '}
                                <span className="mx-1 font-medium text-foreground">{displayPage}</span>
                                of{' '}
                                <span className="ml-1 font-medium text-foreground">{displayTotal}</span>
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => { e.preventDefault(); if (!nextDisabled) handleNext(); }}
                                className={nextDisabled ? 'text-muted-foreground pointer-events-none opacity-50' : 'text-muted-foreground cursor-pointer'}
                                aria-disabled={nextDisabled}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}
        </div>
    );
}
