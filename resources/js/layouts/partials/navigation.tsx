import { NavLink } from '@/components/navLink';

const routeables = [
    { name: 'Dashboard', route: 'dashboard' },
    { name: 'Productos', route: 'products.index' },
    { name: 'Pedidos', route: 'orders.index' },
    { name: 'Escuelas', route: 'schools.index' },
    { name: 'Seguimiento', route: 'tracking.index' },
    { name: 'Stockeables', route: 'stockables.index' },
] as const;

export function Navigation() {
    return (
        <div className="flex justify-between gap-8">
            {routeables.map((routeable) => (
                <NavLink
                    key={routeable.name}
                    href={route(routeable.route)}
                    active={route().current(routeable.route)}
                >
                    {routeable.name}
                </NavLink>
            ))}
        </div>
    );
}
