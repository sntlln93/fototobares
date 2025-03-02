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
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

type FormData = Pick<Stockable, 'name' | 'alert_at' | 'unit' | 'quantity'> & {
    products: number[];
};

export default function CreateStockable({
    products,
}: PageProps<{ products: Product[] }>) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        quantity: 0,
        alert_at: 0,
        unit: 'unit',
        products: [],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setData(
            'products',
            data.products.filter((p) => p > 0),
        );

        post(route('stockables.store'));
    };

    return (
        <AppLayout>
            <Head title="Nuevo stockeable" />

            <form onSubmit={submit} className="p-6">
                <div className="mt-6">
                    <Label htmlFor="name">Nombre</Label>

                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className="mt-1 block w-full"
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
                        min={0}
                        value={data.quantity}
                        onChange={(e) =>
                            setData('quantity', Number(e.target.value))
                        }
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
                        min={0}
                        value={data.alert_at}
                        onChange={(e) =>
                            setData('alert_at', Number(e.target.value))
                        }
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
                        defaultValue={'Unidad'}
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

                    <Button disabled={processing}>Agregar stockeable</Button>
                </div>
            </form>
        </AppLayout>
    );
}
