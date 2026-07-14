import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { Trash } from 'lucide-react';
import { DetailEntry } from '../grouping';
import { ProductListItem } from './product-list-item';

interface DetailGroupProps {
    title: string;
    /** Combo price; extras have none, they are priced item by item */
    price?: number;
    items: DetailEntry[];
    products: Product[];
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
    onRemoveGroup?: () => void;
}

export function DetailGroup({
    title,
    price,
    items,
    products,
    onEdit,
    onRemove,
    onRemoveGroup,
}: DetailGroupProps) {
    if (items.length === 0) return null;

    return (
        <section className="my-4 rounded-md border border-input p-3">
            <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h3 className="min-w-0 text-sm font-medium">
                    {title}
                    {price !== undefined && (
                        <span className="ml-2 text-muted-foreground">
                            {formatPrice(price)}
                        </span>
                    )}
                </h3>

                {onRemoveGroup && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onRemoveGroup();
                        }}
                    >
                        <Trash className="mr-1 h-4 w-4" />
                        Quitar combo
                    </Button>
                )}
            </header>

            <ul>
                {items.map(({ detail, index }) => {
                    const product = products.find(
                        (p) => p.id === detail.product_id,
                    );

                    // The product may have been deleted since the detail was
                    // added or restored
                    if (!product) return null;

                    return (
                        <ProductListItem
                            key={`${detail.product_id}-${index}`}
                            detail={detail}
                            product={product}
                            index={index}
                            onEdit={onEdit}
                            onRemove={onRemove}
                        />
                    );
                })}
            </ul>
        </section>
    );
}
