import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { UserForm, UserFormData } from './form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: route('users.index'),
    },
    {
        title: 'Nuevo usuario',
        href: route('users.create'),
    },
];

export default function CreateUser({
    roles,
}: PageProps<{ roles: Array<{ id: number; name: string }> }>) {
    const { data, setData, post, processing, errors } = useForm<UserFormData>({
        name: '',
        email: '',
        password: '',
        roles: [],
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nuevo usuario" />

            <section className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Nuevo usuario</h1>
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={() => post(route('users.store'))}
                    roles={roles}
                />
            </section>
        </AppLayout>
    );
}
