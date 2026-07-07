import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { UserForm, UserFormData } from './form';

export default function EditUser({
    user,
    roles,
}: PageProps<{
    user: { id: number; name: string; email: string; roles: number[] };
    roles: Array<{ id: number; name: string }>;
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: route('users.index'),
        },
        {
            title: `Editar ${user.name}`,
            href: route('users.edit', { user: user.id }),
        },
    ];

    const { data, setData, put, processing, errors } = useForm<UserFormData>({
        name: user.name,
        email: user.email,
        password: '',
        roles: user.roles,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar ${user.name}`} />

            <section className="p-6">
                <h1 className="mb-4 text-2xl font-bold">
                    Editar usuario: {user.name}
                </h1>
                <UserForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    processing={processing}
                    onSubmit={() =>
                        put(route('users.update', { user: user.id }))
                    }
                    roles={roles}
                    isEdit
                />
            </section>
        </AppLayout>
    );
}
