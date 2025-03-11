import { Checkbox } from '@/components/checkbox';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input as TextInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { FormData } from './form';

export default function EditStockable({
    products,
    stockable,
}: PageProps<{
    products: Product[];
    stockable: Stockable & { products: Product[] };
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Stockeables',
            href: route('stockables.index'),
        },
        {
            title: 'Editar stockeable',
            href: route('stockables.edit', { stockable: stockable.id }),
        },
    ];

    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: stockable.name,
        quantity: String(stockable.quantity),
        alert_at: String(stockable.alert_at),
        unit: stockable.unit,
        products: stockable.products.map((p) => p.id),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('stockables.update', { stockable: stockable.id }));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar stockeable" />

            <form onSubmit={submit} className="p-6">
                <div className="mt-6">
                    <Label htmlFor="name">Nombre</Label>

                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Nombre"
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-6">
                    <Label htmlFor="quantity">Cantidad</Label>

                    <TextInput
                        id="quantity"
                        type="number"
                        name="quantity"
                        value={data.quantity}
                        onChange={(e) => setData('quantity', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Cantidad en números enteros"
                    />

                    <InputError message={errors.quantity} className="mt-2" />
                </div>

                <div className="mt-6">
                    <Label htmlFor="alert_at">
                        Enviar alerta cuando la cantidad sea menor a{' '}
                        <span className="uppercase italic">(opcional)</span>
                    </Label>

                    <TextInput
                        id="alert_at"
                        type="number"
                        name="alert_at"
                        value={data.alert_at}
                        onChange={(e) => setData('alert_at', e.target.value)}
                        className="mt-1 block w-full"
                        placeholder="Cantidad en números enteros"
                    />

                    <InputError message={errors.alert_at} className="mt-2" />
                </div>

                <div className="mt-6">
                    <Label htmlFor="unit">Unidad de medida</Label>
                    <Select
                        name="unit"
                        onValueChange={(value) => setData('unit', value)}
                        defaultValue={stockable.unit}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Unidad">Unidad</SelectItem>
                            <SelectItem value="Paquete">Paquete</SelectItem>
                            <SelectItem value="Caja">Caja</SelectItem>
                            <SelectItem value="Pallet">Pallet</SelectItem>
                            <SelectItem value="Lata">Lata</SelectItem>
                        </SelectContent>
                    </Select>

                    <InputError message={errors.unit} className="mt-2" />
                </div>

                <div className="mt-6">
                    <fieldset>
                        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Productos que usan este insumo
                        </legend>
                        {products.map((product) => (
                            <label
                                className="flex items-center"
                                key={product.id}
                            >
                                <Checkbox
                                    checked={data.products.includes(product.id)}
                                    name={product.name}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setData('products', [
                                                ...data.products,
                                                product.id,
                                            ]);
                                        }
                                    }}
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                    {product.name}
                                </span>
                            </label>
                        ))}
                    </fieldset>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" asChild>
                        <Link href={route('stockables.index')}>Cancelar</Link>
                    </Button>

                    <Button disabled={processing}>Guardar cambios</Button>
                </div>
            </form>
        </AppLayout>
    );
}
