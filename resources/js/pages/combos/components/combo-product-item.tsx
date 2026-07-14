import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Edit,
    Minus,
    Plus,
    RectangleHorizontal,
    RectangleVertical,
    Square,
    Trash,
    User,
    Users,
} from 'lucide-react';
import { SelectedProduct } from '../form';

interface ComboProductItemProps {
    selected: SelectedProduct;
    product: Product;
    updateQuantity: (id: number, value: number) => void;
    updateSubtractValue: (id: number, value: number) => void;
    openEditProductModal: (id: number) => void;
}

export function ComboProductItem({
    selected,
    product,
    updateQuantity,
    updateSubtractValue,
    openEditProductModal,
}: ComboProductItemProps) {
    return (
        <li className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-input bg-background px-4 py-2">
            <div className="flex min-w-0 flex-wrap gap-1">
                {`${selected.quantity}x ${product.name}`}
                {product.product_type_id === 1 && product.variants && (
                    <>
                        <Badge variant="outline" className="gap-1 rounded-lg">
                            {product.variants.colors.map((color) => (
                                <Square
                                    key={color}
                                    className="h-4 w-4"
                                    style={{ fill: color }}
                                />
                            ))}
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                            <User className="h-4 w-4" />
                            <Users className="h-4 w-4" />
                        </Badge>
                        <Badge variant="outline" className="rounded-lg">
                            <RectangleHorizontal className="h-4 w-4" />
                            <RectangleVertical className="h-4 w-4" />
                        </Badge>
                    </>
                )}
            </div>
            <div className="flex gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={selected.quantity === 1}
                    onClick={(e) => {
                        e.preventDefault();
                        updateQuantity(selected.id, -1);
                    }}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                        e.preventDefault();
                        updateQuantity(selected.id, 1);
                    }}
                >
                    <Plus className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="warning"
                    size="icon"
                    title="Editar variantes"
                    disabled={
                        product.product_type_id !== 1 || !product.variants
                    }
                    onClick={(e) => {
                        e.preventDefault();
                        openEditProductModal(selected.id);
                    }}
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    onClick={(e) => {
                        e.preventDefault();
                        updateQuantity(selected.id, -1 * selected.quantity);
                    }}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2">
                <Label
                    htmlFor={`subtract_value_${selected.id}`}
                    className="text-xs text-muted-foreground"
                >
                    Resta del combo si se lo quita
                </Label>
                <Input
                    id={`subtract_value_${selected.id}`}
                    type="number"
                    min={0}
                    className="h-8 w-32"
                    value={selected.subtract_value}
                    onChange={(e) =>
                        updateSubtractValue(selected.id, Number(e.target.value))
                    }
                />
            </div>
        </li>
    );
}
