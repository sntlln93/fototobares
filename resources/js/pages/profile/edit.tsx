import { PageTitle } from '@/components/pageTitle';
import { AuthenticatedLayout } from '@/layouts/authenticated.layout';
import { Head } from '@inertiajs/react';
import { UpdatePasswordForm } from './partials/updatePasswordForm';

export default function Edit() {
    return (
        <AuthenticatedLayout header={<PageTitle>Cuenta</PageTitle>}>
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow dark:bg-gray-800 sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
