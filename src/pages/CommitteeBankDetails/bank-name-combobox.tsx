import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MALAYSIAN_BANKS } from '@/constants/malaysianBanks';

export function BankNameCombobox({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = MALAYSIAN_BANKS.filter((b) =>
        b.toLowerCase().includes(search.toLowerCase()),
    );
    const showCustom =
        search.trim() !== '' &&
        !MALAYSIAN_BANKS.some((b) => b.toLowerCase() === search.toLowerCase());

    function handleSelect(bank: string) {
        onChange(bank);
        setOpen(false);
        setSearch('');
    }

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(''); }}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between font-normal text-muted-foreground"
                >
                    {value || 'Select bank…'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="p-0"
                align="start"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search bank…"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <ScrollArea className="h-52">
                        <CommandList className="max-h-none overflow-visible">
                            {filtered.length === 0 && !showCustom && (
                                <CommandEmpty>No banks found.</CommandEmpty>
                            )}
                            {filtered.length > 0 && (
                                <CommandGroup>
                                    {filtered.map((bank) => (
                                        <CommandItem key={bank} value={bank} onSelect={handleSelect}>
                                            <Check className={cn('mr-2 h-4 w-4', value === bank ? 'opacity-100' : 'opacity-0')} />
                                            {bank}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                            {showCustom && (
                                <CommandGroup heading="Custom">
                                    <CommandItem value={search} onSelect={handleSelect}>
                                        Use &ldquo;{search}&rdquo;
                                    </CommandItem>
                                </CommandGroup>
                            )}
                        </CommandList>
                    </ScrollArea>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
