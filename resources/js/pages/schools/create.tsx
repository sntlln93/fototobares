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
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEventHandler } from 'react';
import { type SchoolFormData } from './form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Escuelas',
        href: route('schools.index'),
    },
    {
        title: 'Nueva escuela',
        href: route('schools.create'),
    },
];

export default function CreateSchool({ users }: PageProps<{ users: User[] }>) {
    const { data, setData, post, processing, errors } = useForm<SchoolFormData>(
        {
            school: {
                name: '',
                level: 'Primaria',
            },
            address: { city: 'La Rioja' },
        },
    );

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('schools.store'));
    };

    const _getError = (path: string) => getError(path, errors);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva escuela" />
            <form onSubmit={submit} className="p-6">
                <section className="mt-6">
                    <h2>Escuela</h2>
                    <div className="flex items-end gap-2">
                        <div className="w-full">
                            <Label htmlFor="school.name">
                                Nombre de la escuela
                            </Label>

                            <TextInput
                                id="school.name"
                                type="text"
                                name="school.name"
                                value={data.school.name}
                                onChange={(e) =>
                                    setData('school', {
                                        ...data.school,
                                        name: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Nombre de la escuela"
                            />

                            <InputError
                                message={_getError('school.name')}
                                className="mt-2"
                            />
                        </div>

                        <div className="w-full">
                            <Label htmlFor="level">Nivel</Label>
                            <Select
                                name="level"
                                onValueChange={(value) =>
                                    setData('school', {
                                        ...data.school,
                                        level: value,
                                    })
                                }
                                defaultValue={'Primaria'}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Jardin">
                                        Jardín
                                    </SelectItem>
                                    <SelectItem value="Primaria">
                                        Primaria
                                    </SelectItem>
                                    <SelectItem value="Secundaria">
                                        Secundaria
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <InputError
                                message={_getError('school.level')}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <Label htmlFor="'school.user_id'">Encargado</Label>
                        <Select
                            name="'school.user_id'"
                            onValueChange={(value) =>
                                setData('school', {
                                    ...data.school,
                                    user_id: Number(value),
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map((user) => (
                                    <SelectItem
                                        key={user.id}
                                        value={String(user.id)}
                                    >
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <InputError
                            message={_getError('school.user_id')}
                            className="mt-2"
                        />
                    </div>
                </section>

                <section className="mt-6">
                    <h2>Director/a</h2>
                    <div className="flex gap-6">
                        <div className="w-full">
                            <Label htmlFor="principal.name">
                                Nombre de la autoridad
                            </Label>

                            <TextInput
                                id="principal.name"
                                name="principal.name"
                                value={data.principal?.name ?? ''}
                                onChange={(e) =>
                                    setData('principal', {
                                        ...data.principal,
                                        name: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Nombre la directora o director"
                            />

                            <InputError
                                message={_getError('principal.name')}
                                className="mt-2"
                            />
                        </div>

                        <div className="w-full">
                            <Label htmlFor="principal.phone">
                                Teléfono de la autoridad
                            </Label>

                            <TextInput
                                id="principal.phone"
                                name="principal.phone"
                                type="text"
                                pattern="[0-9]{10}"
                                value={data.principal?.phone ?? ''}
                                onChange={(e) =>
                                    setData('principal', {
                                        ...data.principal,
                                        phone: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Número de 10 dígitos"
                            />

                            <InputError
                                message={_getError('principal.phone')}
                                className="mt-2"
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-6">
                    <h2>
                        Dirección <span className="italic">(opcional)</span>
                    </h2>
                    <div className="flex gap-6">
                        <div className="w-full">
                            <Label htmlFor="address.street">Calle</Label>

                            <TextInput
                                id="address.street"
                                name="address.street"
                                value={data.address.street}
                                onChange={(e) =>
                                    setData('address', {
                                        ...data.address,
                                        street: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Calle"
                            />

                            <InputError
                                message={_getError('address.street')}
                                className="mt-2"
                            />
                        </div>

                        <div className="w-full">
                            <Label htmlFor="address.number">Altura</Label>

                            <TextInput
                                id="address.number"
                                name="address.number"
                                value={data.address.number}
                                onChange={(e) =>
                                    setData('address', {
                                        ...data.address,
                                        number: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Altura"
                            />

                            <InputError
                                message={_getError('address.number')}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-6">
                        <div className="w-full">
                            <Label htmlFor="address.neighborhood">Barrio</Label>

                            <TextInput
                                id="address.neighborhood"
                                name="address.neighborhood"
                                value={data.address.neighborhood}
                                onChange={(e) =>
                                    setData('address', {
                                        ...data.address,
                                        neighborhood: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Barrio"
                            />

                            <InputError
                                message={_getError('address.neighborhood')}
                                className="mt-2"
                            />
                        </div>

                        <div className="w-full">
                            <Label htmlFor="address.city">Localidad</Label>

                            <TextInput
                                id="address.city"
                                name="address.city"
                                value={data.address.city}
                                onChange={(e) =>
                                    setData('address', {
                                        ...data.address,
                                        city: e.target.value,
                                    })
                                }
                                className="mt-1 block w-full"
                                placeholder="Localidad"
                            />

                            <InputError
                                message={_getError('address.city')}
                                className="mt-2"
                            />
                        </div>
                    </div>
                </section>

                <div className="mt-6 flex justify-end gap-3">
                    <Button variant="outline" asChild>
                        <Link href={route('schools.index')}>Cancelar</Link>
                    </Button>

                    <Button disabled={processing}>Guardar escuela </Button>
                </div>
            </form>
        </AppLayout>
    );
}
