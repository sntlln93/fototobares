import InputError from '@/components/input-error';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { AlertCircle, PlusIcon } from 'lucide-react';
import { ComboWithProducts } from '../form';
import { OrderFormController } from '../hooks/use-create-order-form';
import { ProductListItem } from './product-list-item';

interface ProductsStepProps {
    form: OrderFormController;
    products: Product[];
    combos: ComboWithProducts[];
}

export function ProductsStep({ form, products, combos }: ProductsStepProps) {
    const {
        data,
        errors,
        errorFlags,
        toStep,
        comboDropdownOpen,
        setComboDropdownOpen,
        productDropdownOpen,
        setProductDropdownOpen,
        handleAddCombo,
        handleAddProduct,
        handleEditProduct,
        handleRemoveProduct,
    } = form;

    return (
        <AccordionItem value="products">
            <AccordionTrigger onClick={toStep('products')}>
                <div className="flex items-center gap-2">
                    {errorFlags['products'] && (
                        <AlertCircle className="h-5 w-5 stroke-destructive" />
                    )}
                    Productos
                    {data.order_details && (
                        <Badge className="ml-2">{`${data.order_details.length} productos`}</Badge>
                    )}
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-1">
                <Combobox
                    items={combos.map((combo) => ({
                        label: combo.name,
                        value: combo.id,
                    }))}
                    action={(value) => handleAddCombo(Number(value))}
                    open={comboDropdownOpen}
                    setOpen={setComboDropdownOpen}
                    placeholder="Buscar combo"
                >
                    <Button variant="secondary" size="sm">
                        Añadir desde combo
                        <PlusIcon />
                    </Button>
                </Combobox>

                <Combobox
                    items={products.map((product) => ({
                        label: product.name,
                        value: product.id,
                    }))}
                    action={(value) => handleAddProduct(Number(value))}
                    open={productDropdownOpen}
                    setOpen={setProductDropdownOpen}
                    placeholder="Buscar producto"
                >
                    <Button variant="secondary" size="sm" className="ml-2">
                        Añadir producto
                        <PlusIcon />
                    </Button>
                </Combobox>

                <ul className="my-2 gap-4">
                    {data.order_details.map((selected, index) => {
                        const product = products.find(
                            (p) => p.id === selected.product_id,
                        );
                        const combo = combos.find(
                            (c) => c.id === selected.combo_id,
                        );

                        // The product may have been deleted since the detail
                        // was added or restored
                        if (!product) return null;

                        return (
                            <ProductListItem
                                key={`${product.id}-${combo ? combo.id : ''}-${index}`}
                                detail={selected}
                                product={product}
                                combo={combo}
                                index={index}
                                onEdit={handleEditProduct}
                                onRemove={handleRemoveProduct}
                            />
                        );
                    })}
                </ul>

                <InputError message={errors.order_details} />

                <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                    <Button variant="outline" onClick={toStep('client')}>
                        Anterior
                    </Button>

                    <Button onClick={toStep('order')}>Siguiente</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
