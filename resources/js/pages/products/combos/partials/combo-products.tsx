import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import {
    Edit,
    Minus,
    Plus,
    PlusIcon,
    RectangleHorizontal,
    RectangleVertical,
    Square,
    Trash,
    User,
    Users,
} from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import { SelectedProduct } from '../form';

export function ComboProducts({
    children,
    selectedProducts,
    products,
    openAddProductModal,
    updateQuantity,
}: PropsWithChildren<{
    updateQuantity: (id: number, value: number) => void;
    openAddProductModal: (id: number) => void;
    products: Product[];
    selectedProducts: SelectedProduct[];
}>) {
    const [open, setOpen] = useState(false);

    const action = (id: string) => {
        setOpen(false);
        openAddProductModal(Number(id));
    };
    return (
        <div className="w-[100%]">
            <Label htmlFor="suggested_max_payments">
                Productos del combo ({selectedProducts.length})
            </Label>

            <ul className="my-2 gap-4">
                {selectedProducts.map((selected) => {
                    const product = products.find((p) => p.id === selected.id)!;

                    return (
                        <li
                            className="flex items-center justify-between rounded-md border border-input bg-background px-4 py-2"
                            key={product.id}
                        >
                            <div className="flex gap-1">
                                {`${selected.quantity}x ${product.name}`}
                                {product.type === 'mural' && (
                                    <>
                                        <Badge
                                            variant="outline"
                                            className="gap-1 rounded-lg"
                                        >
                                            {product.variants.colors.map(
                                                (color) => (
                                                    <Square
                                                        key={color}
                                                        className="h-4 w-4"
                                                        style={{
                                                            fill: color,
                                                        }}
                                                    />
                                                ),
                                            )}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="rounded-lg"
                                        >
                                            Fondos: liso
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="rounded-lg"
                                        >
                                            <User className="h-4 w-4" />
                                            <Users className="h-4 w-4" />
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="rounded-lg"
                                        >
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
                                    variant="warning"
                                    size="icon"
                                    disabled={product.type !== 'mural'}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        updateQuantity(
                                            selected.id,
                                            -1 * selected.quantity,
                                        );
                                    }}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {children}

            <Combobox
                className="mt-2"
                items={products
                    .filter(
                        (product) =>
                            !selectedProducts
                                .map((product) => product.id)
                                .includes(product.id),
                    )
                    .map((product) => ({
                        label: product.name,
                        value: product.id,
                    }))}
                action={action}
                open={open}
                setOpen={setOpen}
                placeholder="Buscar producto"
            >
                <Button variant="secondary" size="sm" className="ml-auto">
                    Añadir
                    <PlusIcon />
                </Button>
            </Combobox>
        </div>
    );
}
