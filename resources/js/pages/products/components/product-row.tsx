import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProductIcon } from '@/features/product-icon';
import { formatPrice } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Edit2, Trash } from 'lucide-react';

export function ProductRow({
    product,
    onDelete,
}: {
    product: Product;
    onDelete: (product: Product) => void;
}) {
    return (
        <TableRow>
            <TableCell className="font-medium">{product.id}</TableCell>
            <TableCell className="flex gap-2">
                <ProductIcon type={product.product_type_id} />
                {product.name}
            </TableCell>
            <TableCell>
                {product.financed_price
                    ? formatPrice(product.financed_price)
                    : '-'}
            </TableCell>
            <TableCell>
                {product.unit_price ? formatPrice(product.unit_price) : '-'}
            </TableCell>
            <TableCell>{product.max_payments}</TableCell>
            <TableCell>
                <div className="flex flex-wrap gap-1">
                    {(product.variants ?? []).map((definition) => (
                        <Badge
                            variant="secondary"
                            key={definition.label}
                            className="gap-1"
                        >
                            {definition.type === 'color' &&
                                definition.options.map((option) => (
                                    <span
                                        key={option.label}
                                        className="h-3 w-3 rounded-full border border-gray-300"
                                        style={{
                                            backgroundColor: option.color,
                                        }}
                                    />
                                ))}
                            {definition.label}
                            {definition.nullable && ' (opcional)'}
                        </Badge>
                    ))}
                </div>
            </TableCell>
            <TableCell className="flex gap-2">
                <Link
                    className={buttonVariants({
                        variant: 'warning',
                        size: 'sm',
                    })}
                    href={route('products.edit', {
                        product: product.id,
                    })}
                >
                    <Edit2 />
                </Link>
                <Button
                    size={'sm'}
                    variant={'destructive'}
                    onClick={() => onDelete(product)}
                >
                    <Trash />
                </Button>
            </TableCell>
        </TableRow>
    );
}
