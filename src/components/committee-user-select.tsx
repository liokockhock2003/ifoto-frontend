import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUsers } from '@/store/queries/user';

type CommitteeUserSelectProps = {
    value: number[];
    onChange: (ids: number[]) => void;
};

export function CommitteeUserSelect({ value, onChange }: CommitteeUserSelectProps) {
    const { data, isLoading } = useUsers({ size: 100 });
    const users = data?.content ?? [];

    function toggle(id: number) {
        onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
    }

    const selected = users.filter((u) => value.includes(u.id));
    const label = isLoading
        ? 'Loading...'
        : selected.length === 0
          ? 'Select members...'
          : selected.length <= 2
            ? selected.map((u) => u.fullName).join(', ')
            : `${selected.slice(0, 2).map((u) => u.fullName).join(', ')} +${selected.length - 2} more`;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between font-normal"
                    disabled={isLoading}
                >
                    <span className="truncate text-left">{label}</span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="max-h-56 overflow-y-auto"
                style={{ minWidth: 'var(--radix-dropdown-menu-trigger-width)' }}
            >
                {users.map((user) => (
                    <DropdownMenuCheckboxItem
                        key={user.id}
                        checked={value.includes(user.id)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={() => toggle(user.id)}
                    >
                        <div>
                            <p className="text-sm font-medium">{user.fullName}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                        </div>
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
