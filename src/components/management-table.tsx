import { Pencil, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type ManagementTableColumn<T> = {
    key: string;
    header: string;
    className?: string;
    render: (row: T) => React.ReactNode;
};

type ManagementTableProps<T> = {
    data: T[] | undefined;
    isLoading?: boolean;
    emptyMessage?: string;
    columns: ManagementTableColumn<T>[];
    onEdit: (row: T) => void;
    onDelete: (row: T) => void;
    getKey: (row: T) => string | number;
};

export function ManagementTable<T>({
    data,
    isLoading = false,
    emptyMessage = 'No entries found.',
    columns,
    onEdit,
    onDelete,
    getKey,
}: ManagementTableProps<T>) {
    if (isLoading) {
        return <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>;
    }

    if (!data?.length) {
        return <p className="text-sm text-muted-foreground py-4 text-center">{emptyMessage}</p>;
    }

    return (
        <div className="rounded-md border overflow-hidden text-foreground">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        {columns.map((col) => (
                            <TableHead key={col.key} className={col.className}>
                                {col.header}
                            </TableHead>
                        ))}
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={getKey(row)}>
                            {columns.map((col) => (
                                <TableCell key={col.key} className={col.className}>
                                    {col.render(row)}
                                </TableCell>
                            ))}
                            <TableCell>
                                <div className="flex items-center gap-1 justify-end">
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-muted-foreground"
                                        onClick={() => onEdit(row)}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => onDelete(row)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
