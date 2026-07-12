import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';
import { ComboFormController } from '../hooks/use-combo-form';
import { AddProduct } from './add-product';
import { ComboProducts } from './combo-products';

interface ComboFormProps {
    form: ComboFormController;
    products: Product[];
    submitLabel: string;
}

export function ComboForm({ form, products, submitLabel }: ComboFormProps) {
    const {
        data,
        setData,
        errors,
        processing,
        submit,
        showAddMuralProduct,
        editingVariants,
        setAddProduct,
        openEditProductModal,
        updateQuantity,
        addSelectedProduct,
        closeMuralModal,
    } = form;

    return (
        <>
            {showAddMuralProduct ? (
                <AddProduct
                    addProduct={addSelectedProduct}
                    product={showAddMuralProduct}
                    initialVariants={editingVariants}
                    show={Boolean(showAddMuralProduct)}
                    onClose={closeMuralModal}
                />
            ) : undefined}

            <form onSubmit={submit} className="p-6">
                <div className="mt-6">
                    <Label htmlFor="name">Nombre</Label>

                    <Input
                        id="name"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Nombre"
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-6">
                    <Label htmlFor="suggested_price">Precio</Label>

                    <Input
                        id="suggested_price"
                        type="number"
                        name="suggested_price"
                        min={0}
                        value={data.suggested_price}
                        onChange={(e) =>
                            setData('suggested_price', e.target.value)
                        }
                        className="mt-1 block w-full"
                        placeholder="Cantidad en números enteros"
                    />

                    <InputError
                        message={errors.suggested_price}
                        className="mt-2"
                    />
                </div>
                <div className="mt-6">
                    <Label htmlFor="suggested_max_payments">
                        Cantidad máxima de cuotas
                    </Label>

                    <Input
                        id="suggested_max_payments"
                        type="number"
                        name="suggested_max_payments"
                        min={0}
                        value={data.suggested_max_payments}
                        onChange={(e) =>
                            setData('suggested_max_payments', e.target.value)
                        }
                        className="mt-1 block w-full"
                        placeholder="Cantidad en números enteros"
                    />

                    <InputError
                        message={errors.suggested_max_payments}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6">
                    <ComboProducts
                        selectedProducts={data.products}
                        products={products}
                        openAddProductModal={setAddProduct}
                        openEditProductModal={openEditProductModal}
                        updateQuantity={updateQuantity}
                    >
                        <InputError
                            message={errors.products}
                            className="my-2"
                        />
                    </ComboProducts>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" asChild>
                        <Link href={route('combos.index')}>Cancelar</Link>
                    </Button>

                    <Button disabled={processing}>{submitLabel}</Button>
                </div>
            </form>
        </>
    );
}
