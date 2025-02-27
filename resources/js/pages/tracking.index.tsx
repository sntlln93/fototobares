import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Products() {
    return (
        <AppLayout>
            <Head title="Seguimiento" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            Acá van a estar listados los productos que
                            actualmente se están fabricando
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
