import { Card } from '@/components/card';
import { InputError } from '@/components/inputError';
import { InputLabel } from '@/components/inputLabel';
import { PageTitle } from '@/components/pageTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthenticatedLayout } from '@/layouts/authenticated.layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { FormData, SelectedProduct } from './form';
import { AddProduct } from './partials/add-product';
import { ComboProducts } from './partials/combo-products';

export default function CreateCombo({
    products,
}: PageProps<{ products: Product[] }>) {
    const [addProduct, setAddProduct] = useState<number | null>(null);
    const [showAddMuralProduct, setShowAddMuralProduct] =
        useState<Product | null>(null);

    const { data, setData, post, processing, errors, setError } =
        useForm<FormData>({
            name: '',
            suggested_price: 0,
            suggested_max_payments: 1,
            products: [],
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (products.length === 0) {
            setError('products', 'Debes seleccionar al menos un producto');

            return;
        }
        post(route('combos.store'));
    };

    useEffect(() => {
        if (!addProduct) return;

        const product = products.find((producto) => producto.id === addProduct);

        if (!product) return;

        if (product.type !== 'mural') {
            setData('products', [
                ...data.products,
                {
                    id: product.id,
                    quantity: 1,
                },
            ]);
        } else {
            setShowAddMuralProduct(products.find((p) => p.id === addProduct)!);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addProduct]);

    const updateQuantity = (id: number, value: number) => {
        const updatableProduct = data.products.find(
            (product) => product.id === id,
        );

        if (!updatableProduct) {
            throw new Error('No se encontró ningún producto con id: ${id}');
        }

        updatableProduct.quantity = updatableProduct.quantity + value;

        if (updatableProduct.quantity < 1) {
            setData(
                'products',
                data.products.filter(
                    (product) => product.id !== updatableProduct.id,
                ),
            );
        } else {
            setData('products', [
                ...data.products.filter(
                    (product) => product.id !== updatableProduct.id,
                ),
                updatableProduct,
            ]);
        }
    };

    return (
        <AuthenticatedLayout header={<PageTitle>Agregar combo</PageTitle>}>
            <Head title="Combos" />

            {showAddMuralProduct ? (
                <AddProduct
                    addProduct={(product: SelectedProduct) => {
                        setData('products', [...data.products, product]);
                    }}
                    product={showAddMuralProduct}
                    show={Boolean(showAddMuralProduct)}
                    onClose={() => setShowAddMuralProduct(null)}
                />
            ) : undefined}

            <Card>
                <form onSubmit={submit} className="p-6">
                    <div className="mt-6">
                        <InputLabel htmlFor="name" value="Nombre" />

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
                        <InputLabel htmlFor="suggested_price" value="Precio" />

                        <Input
                            id="suggested_price"
                            type="number"
                            name="suggested_price"
                            min={0}
                            value={data.suggested_price}
                            onChange={(e) =>
                                setData(
                                    'suggested_price',
                                    Number(e.target.value),
                                )
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
                        <InputLabel htmlFor="suggested_max_payments">
                            Cantidad máxima de cuotas
                        </InputLabel>

                        <Input
                            id="suggested_max_payments"
                            type="number"
                            name="suggested_max_payments"
                            min={0}
                            value={data.suggested_max_payments}
                            onChange={(e) =>
                                setData(
                                    'suggested_max_payments',
                                    Number(e.target.value),
                                )
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

                        <Button disabled={processing}>Agregar combo</Button>
                    </div>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}
