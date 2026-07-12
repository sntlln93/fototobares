import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { SchoolFormFields } from './components/school-form-fields';
import { useEditSchool } from './hooks/use-edit-school';

export default function EditSchool({
    school,
    users,
}: PageProps<{
    school: School & { principal?: Principal; address: Address };
    users: User[];
}>) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Escuelas',
            href: route('schools.index'),
        },
        {
            title: 'Editar escuela',
            href: route('schools.edit', { school: school.id }),
        },
    ];

    const { data, setData, processing, submit, getError } =
        useEditSchool(school);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar escuela" />

            <form onSubmit={submit} className="p-6">
                <SchoolFormFields
                    data={data}
                    setData={setData}
                    getError={getError}
                    processing={processing}
                    users={users}
                    levelDefaultValue={school.level}
                    levelErrorPath="school.name"
                    encargadoValue={String(data.school.user_id)}
                />
            </form>
        </AppLayout>
    );
}
