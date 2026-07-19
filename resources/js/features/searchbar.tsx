import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { onSearch } from '@/lib/services/filter';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { FilterX, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface SearchbarProps {
    indexRoute: string;
    /** Route params for pages that are not plain indexes (e.g. a classroom). */
    routeParams?: Record<string, string | number>;
    /** The term already applied, echoed back by the page, so it survives reloads. */
    term?: string | null;
    placeholder?: string;
}

export function Searchbar({
    indexRoute,
    routeParams,
    term,
    placeholder,
}: SearchbarProps) {
    const applied = term ?? '';
    const [search, setSearch] = useState(applied);
    const [debouncedSearch] = useDebounce(search, 1000);
    const requested = useRef(applied);
    const [inFlight, setInFlight] = useState(false);
    const isSearching = search !== debouncedSearch || inFlight;

    useEffect(() => {
        // Already the applied filter: nothing to do (this is also the mount case).
        // Any other term is searched, however short: order numbers are 1-2 digits.
        if (debouncedSearch === applied) return;

        // The visit preserves this component's state, so a re-render must not
        // fire the same search again.
        if (debouncedSearch === requested.current) return;

        requested.current = debouncedSearch;
        setInFlight(true);
        onSearch(debouncedSearch, indexRoute, routeParams, {
            onFinish: () => setInFlight(false),
        });
    }, [debouncedSearch, applied, indexRoute, routeParams]);

    return (
        <div className="relative flex gap-1">
            <Input
                id="search"
                name="search"
                placeholder={placeholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                // Room for the search icon sitting on top of the input
                className="pr-10"
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
                {isSearching ? (
                    <Spinner size={16} className="text-muted-foreground" />
                ) : (
                    <Search />
                )}
            </div>
            <Button
                variant="outline"
                size="icon"
                onClick={() => router.get(route(indexRoute, routeParams))}
            >
                <FilterX />
            </Button>
        </div>
    );
}
