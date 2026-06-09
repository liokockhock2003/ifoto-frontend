import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ListFilter, Search } from 'lucide-react';
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFilteredRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type Row,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type FilterDef = {
    id: string;
    label: string;
    options: { value: string; label: string }[];
};

interface ExpandableDataTableProps<TData> {
    columns: ColumnDef<TData, any>[];
    data: TData[];
    title?: string;
    isLoading?: boolean;
    groupBy: (row: TData) => string;
    searchable?: boolean;
    filters?: FilterDef[];
}

export function ExpandableDataTable<TData>({
    columns,
    data,
    title,
    isLoading = false,
    groupBy,
    searchable = false,
    filters,
}: ExpandableDataTableProps<TData>) {
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // Augment column defs to attach 'inArray' filterFn for each filterable column
    const augmentedColumns = useMemo<ColumnDef<TData, any>[]>(() => {
        if (!filters?.length) return columns;
        const filterIds = new Set(filters.map((f) => f.id));
        return columns.map((col) => {
            const colId = ('accessorKey' in col ? String((col as any).accessorKey) : undefined) ?? col.id;
            if (!colId || !filterIds.has(colId)) return col;
            return { ...col, filterFn: 'inArray' as any };
        });
    }, [columns, filters]);

    const table = useReactTable({
        data,
        columns: augmentedColumns,
        state: { globalFilter, columnFilters },
        filterFns: {
            // Checks whether the column's cell value is in the selected values array
            inArray: (row: Row<TData>, columnId: string, value: string[]) =>
                !value?.length || value.includes(row.getValue(columnId) as string),
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        globalFilterFn: 'includesString',
    });

    const filteredRows = table.getFilteredRowModel().rows;

    const grouped = useMemo(() => {
        const map = new Map<string, Row<TData>[]>();
        filteredRows.forEach((row) => {
            const key = groupBy(row.original);
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(row);
        });
        return map;
    }, [filteredRows, groupBy]);

    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    const toggle = (key: string) =>
        setExpanded((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });

    const getActiveValues = (filterId: string): string[] => {
        const cf = columnFilters.find((f) => f.id === filterId);
        return Array.isArray(cf?.value) ? (cf.value as string[]) : [];
    };

    const toggleFilterValue = (filterId: string, value: string) => {
        setColumnFilters((prev) => {
            const current = prev.find((f) => f.id === filterId);
            const currentValues: string[] = Array.isArray(current?.value) ? (current.value as string[]) : [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];
            const without = prev.filter((f) => f.id !== filterId);
            return newValues.length === 0 ? without : [...without, { id: filterId, value: newValues }];
        });
    };

    const showToolbar = searchable || (filters && filters.length > 0);

    return (
        <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {title && (
                    <div>
                        <CardTitle className="text-base">{title}</CardTitle>
                        <CardDescription>
                            {filteredRows.length} item{filteredRows.length !== 1 ? 's' : ''}
                            {filteredRows.length !== data.length && ` of ${data.length}`}
                        </CardDescription>
                    </div>
                )}
                {showToolbar && (
                    <div className="flex flex-wrap items-center gap-2">
                        {searchable && (
                            <div className="relative w-full sm:w-56">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                                <Input
                                    className="pl-8 h-8 text-xs rounded-4xl"
                                    placeholder="Search..."
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                />
                            </div>
                        )}
                        {filters?.map((filter) => {
                            const activeValues = getActiveValues(filter.id);
                            return (
                                <DropdownMenu key={filter.id}>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-4xl">
                                            <ListFilter className="h-3.5 w-3.5" />
                                            {filter.label}
                                            {activeValues.length > 0 && (
                                                <span className="rounded-full bg-primary text-primary-foreground text-[10px] font-medium px-1.5 leading-4">
                                                    {activeValues.length}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-40">
                                        <DropdownMenuLabel className="text-xs">{filter.label}</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {filter.options.map((opt) => (
                                            <DropdownMenuCheckboxItem
                                                key={opt.value}
                                                checked={activeValues.includes(opt.value)}
                                                onCheckedChange={() => toggleFilterValue(filter.id, opt.value)}
                                                className="text-xs"
                                            >
                                                {opt.label}
                                            </DropdownMenuCheckboxItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        })}
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {flexRender(h.column.columnDef.header, h.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <TableRow key={i}>
                                    {augmentedColumns.map((_, j) => (
                                        <TableCell key={j} className="px-4 py-3">
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                            : grouped.size === 0
                                ? (
                                    <TableRow>
                                        <TableCell colSpan={augmentedColumns.length} className="h-24 text-center text-sm text-muted-foreground">
                                            No items found.
                                        </TableCell>
                                    </TableRow>
                                )
                                : Array.from(grouped.entries()).map(([key, groupRows]) => {
                                    const isOpen = expanded.has(key);
                                    return (
                                        <Fragment key={key}>
                                            <TableRow
                                                className="bg-muted/30 hover:bg-muted/50 cursor-pointer select-none"
                                                onClick={() => toggle(key)}
                                            >
                                                <TableCell colSpan={augmentedColumns.length} className="px-4 py-2">
                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                                        {isOpen
                                                            ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                            : <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        }
                                                        {key}
                                                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                                                            ({groupRows.length})
                                                        </span>
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                            {isOpen && groupRows.map((row) => (
                                                <TableRow key={row.id} className="transition-colors hover:bg-muted/50">
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id} className="px-4 py-3">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </Fragment>
                                    );
                                })
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
