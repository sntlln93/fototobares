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
import { getError } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import {
    backgrounds,
    colors,
    default_variants,
    FormData,
    orientations,
    photo_types,
} from './form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Productos',
        href: route('products.index'),
    },
    {
        title: 'Nuevo producto',
        href: route('products.create'),
    },
];

export default function CreateProduct() {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        name: '',
        unit_price: 0,
        max_payments: 1,
        type: 'mural',
        variants: default_variants,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('products.store'));
    };

    const _getError = (path: string) => getError(path, errors);

    const _setVariant =
        (
            key: Exclude<keyof FormData['variants'], 'dimentions'>,
            value: string,
        ) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setData('variants', {
                ...data.variants,
                [key]: e.target.checked
                    ? Array.from(
                          new Set([
                              ...(Array.isArray(data.variants[key])
                                  ? data.variants[key]
                                  : []),
                              value,
                          ]),
                      ) // Add if checked
                    : data.variants[key].filter((item) => item !== value),
            });
        };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo producto" />

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
                    <Label htmlFor="type">Tipo</Label>

                    <Select
                        name="type"
                        onValueChange={(value) =>
                            setData('type', value as ProductType)
                        }
                        defaultValue="mural"
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="mural">Mural</SelectItem>
                            <SelectItem value="banda">Banda</SelectItem>
                            <SelectItem value="taza">Taza</SelectItem>
                            <SelectItem value="medalla">Medalla</SelectItem>
                        </SelectContent>
                    </Select>

                    <InputError message={errors.type} className="mt-2" />
                </div>

                <div className="mt-6">
                    <Label htmlFor="unit_price">Precio unitario</Label>

                    <TextInput
                        id="unit_price"
                        type="number"
                        name="unit_price"
                        min={0}
                        value={data.unit_price}
                        onChange={(e) =>
                            setData('unit_price', Number(e.target.value))
                        }
                        className="mt-1 block w-full"
                        placeholder="Cantidad en números enteros"
                    />

                    <InputError message={errors.unit_price} className="mt-2" />
                </div>
                <div className="mt-6">
                    <Label htmlFor="max_payments">
                        Cantidad máxima de cuotas
                    </Label>

                    <TextInput
                        id="max_payments"
                        type="number"
                        name="max_payments"
                        min={0}
                        value={data.max_payments}
                        onChange={(e) =>
                            setData('max_payments', Number(e.target.value))
                        }
                        className="mt-1 block w-full"
                        placeholder="Cantidad en números enteros"
                    />

                    <InputError
                        message={errors.max_payments}
                        className="mt-2"
                    />
                </div>

                {data.type === 'mural' ? (
                    <>
                        <div className="mt-6">
                            <Label htmlFor="dimentions">
                                Medidas (ancho x alto)
                            </Label>
                            <TextInput
                                id="dimentions"
                                name="variants.dimentions"
                                min={0}
                                value={data.variants.dimentions}
                                onChange={(e) =>
                                    setData('variants', {
                                        ...data.variants,
                                        dimentions: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Cantidad en números enteros"
                            />

                            <InputError
                                message={_getError('variants.dimentions')}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Orientaciones disponibles para este producto
                                </legend>
                                {orientations.map((orientation) => (
                                    <label
                                        className="flex items-center"
                                        key={orientation}
                                    >
                                        <Checkbox
                                            name={orientation}
                                            checked={data.variants.orientations.includes(
                                                orientation,
                                            )}
                                            onChange={_setVariant(
                                                'orientations',
                                                orientation,
                                            )}
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {orientation}
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                            <InputError
                                message={_getError('variants.orientations')}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Colores disponibles para este producto
                                </legend>
                                {colors.map((color) => (
                                    <label
                                        className="flex items-center"
                                        key={color}
                                    >
                                        <Checkbox
                                            name={color}
                                            checked={data.variants.colors.includes(
                                                color,
                                            )}
                                            onChange={_setVariant(
                                                'colors',
                                                color,
                                            )}
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {color}
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                            <InputError
                                message={_getError('variants.colors')}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Fondos disponibles para este producto
                                </legend>
                                {backgrounds.map((background) => (
                                    <label
                                        className="flex items-center"
                                        key={background}
                                    >
                                        <Checkbox
                                            name={background}
                                            checked={data.variants.backgrounds.includes(
                                                background,
                                            )}
                                            onChange={_setVariant(
                                                'backgrounds',
                                                background,
                                            )}
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {background}
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                            <InputError
                                message={_getError('variants.backgrounds')}
                                className="mt-2"
                            />
                        </div>

                        <div className="mt-6">
                            <fieldset>
                                <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Tipo de foto
                                </legend>
                                {photo_types.map((photo_type) => (
                                    <label
                                        className="flex items-center"
                                        key={photo_type}
                                    >
                                        <Checkbox
                                            name={photo_type}
                                            checked={data.variants.photo_types.includes(
                                                photo_type,
                                            )}
                                            onChange={_setVariant(
                                                'photo_types',
                                                photo_type,
                                            )}
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            {photo_type}
                                        </span>
                                    </label>
                                ))}
                            </fieldset>
                            <InputError
                                message={_getError('variants.photo_types')}
                                className="mt-2"
                            />
                        </div>
                    </>
                ) : undefined}

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" asChild>
                        <Link href={route('products.index')}>Cancelar</Link>
                    </Button>

                    <Button disabled={processing}>Agregar producto</Button>
                </div>
            </form>
        </AppLayout>
    );
}
