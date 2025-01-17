import { Card } from '@/components/card';
import { InputError } from '@/components/inputError';
import { InputLabel } from '@/components/inputLabel';
import { PageTitle } from '@/components/pageTitle';
import { TextInput } from '@/components/textInput';
import { Button } from '@/components/ui/button';
import { AuthenticatedLayout } from '@/layouts/authenticated.layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function EditSchool({ school }: PageProps<{ school: School }>) {
    const { data, setData, put, processing, errors } = useForm({
        school: {
            name: school.name,
        },
        principal: {
            name: school.principal.name,
            phone: school.principal.phone,
        },
        address: {
            street: school.address.street ?? '',
            number: school.address.number ?? '',
            neighborhood: school.address.neighborhood ?? '',
            city: school.address.city,
        },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('schools.update', { school: school.id }));
    };

    /**
     * This should be typesafe
     */
    const getError = (key: string) => {
        const err = errors as Record<string, string>;
        /*
        Errors { [key:keyof errors]: string | {[key: keyof errors]: string} }
        */

        return err[key];
    };

    return (
        <AuthenticatedLayout header={<PageTitle>Nueva escuela</PageTitle>}>
            <Head title="Stock" />
            <Card>
                <form onSubmit={submit} className="p-6">
                    <section className="mt-6">
                        <h2>Escuela</h2>
                        <div>
                            <InputLabel
                                htmlFor="school.name"
                                value="Nombre de la escuela"
                            />

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
                                isFocused
                                placeholder="Nombre de la escuela"
                            />

                            <InputError
                                message={getError('school.name')}
                                className="mt-2"
                            />
                        </div>
                    </section>

                    <section className="mt-6">
                        <h2>Director/a</h2>
                        <div className="flex gap-6">
                            <div className="w-full">
                                <InputLabel
                                    htmlFor="principal.name"
                                    value="Nombre de la autoridad"
                                />

                                <TextInput
                                    id="principal.name"
                                    name="principal.name"
                                    value={data.principal.name}
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
                                    message={getError('principal.name')}
                                    className="mt-2"
                                />
                            </div>

                            <div className="w-full">
                                <InputLabel
                                    htmlFor="principal.phone"
                                    value="Teléfono de la autoridad"
                                />

                                <TextInput
                                    id="principal.phone"
                                    name="principal.phone"
                                    type="text"
                                    pattern="[0-9]{10}"
                                    value={data.principal.phone}
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
                                    message={getError('principal.phone')}
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
                                <InputLabel
                                    htmlFor="address.street"
                                    value="Calle"
                                />

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
                                    message={getError('address.street')}
                                    className="mt-2"
                                />
                            </div>

                            <div className="w-full">
                                <InputLabel
                                    htmlFor="address.number"
                                    value="Altura"
                                />

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
                                    message={getError('address.number')}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-6">
                            <div className="w-full">
                                <InputLabel
                                    htmlFor="address.neighborhood"
                                    value="Barrio"
                                />

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
                                    message={getError('address.neighborhood')}
                                    className="mt-2"
                                />
                            </div>

                            <div className="w-full">
                                <InputLabel
                                    htmlFor="address.city"
                                    value="Localidad"
                                />

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
                                    message={getError('address.city')}
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
            </Card>
        </AuthenticatedLayout>
    );
}
