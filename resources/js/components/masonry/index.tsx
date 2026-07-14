import { useMasonry } from '@/hooks/use-masonry';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface MasonryItem {
    key: string;
    content: ReactNode;
}

/**
 * Lays the items out in balanced columns: each one goes to the shortest column,
 * so a short card never leaves a hole next to a tall neighbour. Below the first
 * breakpoint everything collapses into a single column, in source order.
 */
export function Masonry({
    items,
    className,
}: {
    items: MasonryItem[];
    className?: string;
}) {
    const { columns, register } = useMasonry(items.map((item) => item.key));

    const contentOf = new Map(items.map((item) => [item.key, item.content]));

    return (
        <div
            className={cn(
                'flex flex-col gap-6 lg:flex-row lg:items-start',
                className,
            )}
        >
            {columns.map((keys, column) => (
                <div
                    key={column}
                    className="flex min-w-0 flex-1 flex-col gap-6"
                >
                    {keys.map((key) => (
                        <div key={key} ref={register(key)}>
                            {contentOf.get(key)}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
