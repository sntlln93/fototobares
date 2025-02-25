import { NavLink } from '@/components/navLink';
import { AuthenticatedLayout } from '@/layouts/authenticated.layout';
import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

const routeables = [
    { name: 'Productos', route: 'products.index' },
    { name: 'Combos', route: 'combos.index' },
] as const;

const ProductNavigation = () => {
    return (
        <nav className="flex gap-2">
            {routeables.map((routeable) => (
                <NavLink
                    key={routeable.name}
                    href={route(routeable.route)}
                    active={route().current(routeable.route)}
                >
                    {routeable.name}
                </NavLink>
            ))}
        </nav>
    );
};

export function ProductLayout({ children }: PropsWithChildren) {
    return (
        <AuthenticatedLayout header={<ProductNavigation />}>
            <Head title="Productos" />
            {children}
        </AuthenticatedLayout>
    );
}
