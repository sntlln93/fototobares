import InputError from '@/components/input-error';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { formatPrice } from '@/lib/utils';
import { AlertCircle, PlusIcon } from 'lucide-react';
import { ComboWithProducts } from '../form';
import { groupDetails } from '../grouping';
import { OrderFormController } from '../hooks/use-create-order-form';
import { DetailGroup } from './detail-group';

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
        handleRemoveCombo,
        breakdown,
    } = form;

    const { comboGroups, extras } = groupDetails(data.order_details, combos);

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

                <div className="mt-3 text-right text-sm font-medium">
                    Total: {formatPrice(breakdown.total)}
                </div>

                {comboGroups.map(({ combo, items }) => (
                    <DetailGroup
                        key={combo.id}
                        title={combo.name}
                        price={combo.suggested_price}
                        items={items}
                        products={products}
                        onEdit={handleEditProduct}
                        onRemove={handleRemoveProduct}
                        onRemoveGroup={() => handleRemoveCombo(combo.id)}
                    />
                ))}

                <DetailGroup
                    title="Otros productos"
                    items={extras}
                    products={products}
                    onEdit={handleEditProduct}
                    onRemove={handleRemoveProduct}
                />

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
