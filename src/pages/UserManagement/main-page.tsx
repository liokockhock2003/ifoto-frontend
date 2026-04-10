import { useEffect, useRef, useState } from 'react';
import { Search, UserCog } from 'lucide-react';

import { DataTable } from '@/components/data-table';
import { Input } from '@/components/ui/input';

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
        setValue(filters.search ?? '');
    }, [filters.search]);

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

            <DataTable
                columns={userTableColumns}
                data={users}
                isLoading={isLoading}
                isError={isError}
                error={error ?? undefined}
                onRetry={() => void refetch()}
                title="All Users"
                totalElements={totalElements}
                headerActions={<SearchInput />}
                page={filters.page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyMessage="No users found."
            />
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
