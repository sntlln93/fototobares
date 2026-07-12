import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProductIcon } from '@/features/product-icon';
import { formatPrice, getColorEs } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Edit2, Trash } from 'lucide-react';
import { ProductDesign } from './product-design';

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
            <TableCell>{product.variants?.dimentions}</TableCell>
            <TableCell>
                {product.variants && (
                    <ProductDesign variants={product.variants} />
                )}
            </TableCell>
            <TableCell>
                {(product.variants?.backgrounds ?? []).length > 0 &&
                    product.variants?.backgrounds.map((background) => (
                        <Badge variant="secondary" key={background}>
                            {getColorEs(background)}
                        </Badge>
                    ))}
            </TableCell>
            <TableCell>
                {(product.variants?.colors ?? []).length > 0 &&
                    product.variants?.colors.map((color) => (
                        <Badge variant="secondary" key={color}>
                            {getColorEs(color)}
                        </Badge>
                    ))}
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
