import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ProductIcon } from '@/features/product-icon';
import { Flame } from 'lucide-react';
import { VariantBadges } from './variant-badges';

/**
 * "Ver" button listing the order's products. A popover rather than a hover
 * tooltip: the app is used mostly on phones, where hover does not exist.
 */
export function ProductsTooltip({ products }: { products: OrderProduct[] }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    aria-label="Ver productos"
                >
                    Ver
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="start">
                <h4 className="text-sm font-medium">Productos</h4>
                <ul className="divide-y divide-border">
                    {products.map((product) => (
                        <li
                            key={product.order_detail_id}
                            className="flex items-start gap-3 py-2.5 last:pb-0"
                        >
                            <div className="rounded bg-muted p-1.5">
                                <ProductIcon
                                    type={product.product_type_id}
                                    className="h-4 w-4 text-muted-foreground"
                                />
                            </div>
                            <div className="min-w-0 space-y-1.5">
                                <p className="pt-0.5 text-sm font-medium">
                                    {product.name}
                                </p>
                                {product.priority && (
                                    <Badge
                                        variant="destructive"
                                        className="gap-1"
                                    >
                                        <Flame className="h-3 w-3" />
                                        Prioridad
                                    </Badge>
                                )}
                                {product.product_type_id === 1 && (
                                    <VariantBadges variant={product.variant} />
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </PopoverContent>
        </Popover>
    );
}
