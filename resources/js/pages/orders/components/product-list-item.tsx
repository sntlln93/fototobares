import { Button } from '@/components/ui/button';
import { snapshotFromSelection } from '@/lib/variants';
import { Edit, Trash } from 'lucide-react';
import { OrderFormData } from '../form-state';
import { VariantBadges } from './variant-badges';

interface ProductListItemProps {
    detail: OrderFormData['order_details'][number];
    product: Product;
    index: number;
    onEdit: (index: number) => void;
    onRemove: (index: number) => void;
}

export function ProductListItem({
    detail,
    product,
    index,
    onEdit,
    onRemove,
}: ProductListItemProps) {
    const snapshot = snapshotFromSelection(
        product.variants ?? [],
        detail.variant ?? {},
    );

    return (
        <li className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-input bg-background px-4 py-2">
            <div className="flex min-w-0 flex-col gap-2">
                <span>{product.name}</span>
                <VariantBadges variant={snapshot} />
            </div>
            <div className="flex gap-1">
                <Button
                    variant="warning"
                    size="icon"
                    title="Editar variantes y notas"
                    onClick={(e) => {
                        e.preventDefault();
                        onEdit(index);
                    }}
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    title="Quitar del pedido"
                    onClick={(e) => {
                        e.preventDefault();
                        onRemove(index);
                    }}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        </li>
    );
}
