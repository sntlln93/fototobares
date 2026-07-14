import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Edit,
    RectangleHorizontal,
    RectangleVertical,
    Square,
    Trash,
    User,
    Users,
} from 'lucide-react';
import { OrderFormData } from '../form-state';

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
    return (
        <li className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-input bg-background px-4 py-2">
            <div className="flex min-w-0 flex-col gap-2">
                <span>{product.name}</span>
                {product.product_type_id === 1 ? (
                    <div className="flex items-center">
                        <Badge variant="outline" className="gap-1 rounded-lg">
                            <Square
                                className="h-4 w-4"
                                style={{ fill: detail.variant?.color }}
                            />
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                            {detail.variant?.background}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                            {detail.variant?.photo_type === 'individual' ? (
                                <User className="h-4 w-4" />
                            ) : (
                                <Users className="h-4 w-4" />
                            )}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                            {detail.variant?.orientation === 'vertical' ? (
                                <RectangleVertical className="h-4 w-4" />
                            ) : (
                                <RectangleHorizontal className="h-4 w-4" />
                            )}
                        </Badge>
                    </div>
                ) : undefined}
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
