import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export function ProductLayout({ children }: PropsWithChildren) {
    return (
        <AppLayout>
            <Head title="Productos" />
            {children}
        </AppLayout>
    );
}
