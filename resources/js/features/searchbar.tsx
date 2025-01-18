import { TextInput } from '@/components/textInput';
import { Button, buttonVariants } from '@/components/ui/button';
import { onSearch } from '@/lib/services/filter';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { FilterX, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export function Searchbar({ indexRoute }: { indexRoute: string }) {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 1000);

    useEffect(() => {
        if (debouncedSearch.length < 3) return;

        onSearch(debouncedSearch, indexRoute);
    }, [debouncedSearch, indexRoute]);

    return (
        <div className="relative flex gap-1">
            <TextInput
                id="search"
                name="search"
                className="h-10 pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <div
                className={cn(
                    buttonVariants({
                        variant: 'ghost',
                        size: 'icon',
                    }),
                    'pointer-events-none absolute right-11',
                )}
            >
                <Search />
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={() => router.get(route(indexRoute))}
            >
                <FilterX />
            </Button>
        </div>
    );
}
