import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { FormData, SelectedProduct } from './form';
import { AddProduct } from './partials/add-product';
import { ComboProducts } from './partials/combo-products';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Combos',
        href: route('combos.index'),
    },
    {
        title: 'Nuevo combo',
        href: route('combos.create'),
    },
];

export default function CreateCombo({
    products,
}: PageProps<{ products: Product[] }>) {
    const [addProduct, setAddProduct] = useState<number | null>(null);
    const [showAddMuralProduct, setShowAddMuralProduct] =
        useState<Product | null>(null);

    const { data, setData, post, processing, errors, setError } =
        useForm<FormData>({
            name: '',
            suggested_price: '0',
            suggested_max_payments: '0',
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

        if (product.product_type_id !== 1) {
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
        <AppLayout breadcrumbs={breadcrumbs}>
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
        </AppLayout>
    );
}
