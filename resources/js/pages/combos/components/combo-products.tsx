import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { PlusIcon } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import { SelectedProduct } from '../form';
import { ComboProductItem } from './combo-product-item';

export function ComboProducts({
    children,
    selectedProducts,
    products,
    openAddProductModal,
    openEditProductModal,
    updateQuantity,
    updateSubtractValue,
}: PropsWithChildren<{
    updateQuantity: (id: number, value: number) => void;
    updateSubtractValue: (id: number, value: number) => void;
    openAddProductModal: (id: number) => void;
    openEditProductModal: (id: number) => void;
    products: Product[];
    selectedProducts: SelectedProduct[];
}>) {
    const [open, setOpen] = useState(false);

    const action = (id: string) => {
        setOpen(false);
        openAddProductModal(Number(id));
    };

    return (
        <div className="w-full">
            <Label>Productos del combo ({selectedProducts.length})</Label>

            <ul className="my-2 gap-4">
                {selectedProducts.map((selected) => {
                    const product = products.find((p) => p.id === selected.id);

                    // The product may have been deleted since it was added
                    if (!product) return null;

                    return (
                        <ComboProductItem
                            key={product.id}
                            selected={selected}
                            product={product}
                            updateQuantity={updateQuantity}
                            updateSubtractValue={updateSubtractValue}
                            openEditProductModal={openEditProductModal}
                        />
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
