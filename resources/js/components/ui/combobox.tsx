import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

export function Combobox({
    className = 'last:',
    children,
    open,
    action,
    items,
    setOpen,
    placeholder,
}: PropsWithChildren<{
    className?: string;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    open: boolean;
    items: { label: string; value: number | string }[];
    action: (value: string) => void;
    placeholder: string;
}>) {
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className={cn('w-[200px] p-0', className)}>
                <Command>
                    <CommandInput placeholder={placeholder} />
                    <CommandList>
                        <CommandEmpty>
                            No se encontró ningún elemento que coincida con la
                            búsqueda
                        </CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={String(item.value)}
                                    onSelect={action}
                                >
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
