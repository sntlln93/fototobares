import { InertiaFormProps, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { FormData, SelectedProduct, upsertSelectedProduct } from '../form';

interface UseComboFormParams {
    products: Product[];
    initialData: FormData;
    onSubmit: (form: InertiaFormProps<FormData>) => void;
}

export function useComboForm({
    products,
    initialData,
    onSubmit,
}: UseComboFormParams) {
    const [addProduct, setAddProduct] = useState<number | null>(null);
    const [showAddMuralProduct, setShowAddMuralProduct] =
        useState<Product | null>(null);
    const [editingVariants, setEditingVariants] = useState<
        SelectedProduct['variants'] | null
    >(null);

    const form = useForm<FormData>(initialData);
    const { data, setData, setError } = form;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (products.length === 0) {
            setError('products', 'Debes seleccionar al menos un producto');

            return;
        }
        onSubmit(form);
    };

    useEffect(() => {
        if (!addProduct) return;

        const product = products.find((producto) => producto.id === addProduct);

        if (!product) return;

        // Products without configurable variants are added directly
        if (product.product_type_id !== 1 || !product.variants) {
            setData('products', [
                ...data.products,
                {
                    id: product.id,
                    quantity: 1,
                },
            ]);
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- state-as-event flow; superseded by the #96/#97 combo redesign
            setShowAddMuralProduct(product);
        }

        // Reset so the same product can be re-added after being removed
        setAddProduct(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addProduct]);

    const openEditProductModal = (id: number) => {
        const product = products.find((p) => p.id === id);
        const selected = data.products.find((p) => p.id === id);

        if (!product || !selected) return;

        setEditingVariants(selected.variants ?? null);
        setShowAddMuralProduct(product);
    };

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

    const addSelectedProduct = (product: SelectedProduct) => {
        setData('products', upsertSelectedProduct(data.products, product));
    };

    const closeMuralModal = () => {
        setShowAddMuralProduct(null);
        setEditingVariants(null);
    };

    return {
        data,
        setData,
        errors: form.errors,
        processing: form.processing,
        setAddProduct,
        showAddMuralProduct,
        editingVariants,
        submit,
        openEditProductModal,
        updateQuantity,
        addSelectedProduct,
        closeMuralModal,
    };
}

export type ComboFormController = ReturnType<typeof useComboForm>;
