import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { SchoolFormFields } from './components/school-form-fields';
import { useCreateSchool } from './hooks/use-create-school';

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
    const { data, setData, processing, submit, getError } = useCreateSchool();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nueva escuela" />
            <form onSubmit={submit} className="p-6">
                <SchoolFormFields
                    data={data}
                    setData={setData}
                    getError={getError}
                    processing={processing}
                    users={users}
                    levelDefaultValue="Primaria"
                    levelErrorPath="school.level"
                />
            </form>
        </AppLayout>
    );
}
