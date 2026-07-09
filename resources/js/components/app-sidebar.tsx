import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import {
    Group,
    Home,
    ListOrdered,
    Package,
    PackageOpen,
    Recycle,
    Rss,
    School,
    ShoppingCart,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';
import { NavUser } from './nav-user';

const SALES = ['master', 'administración', 'oficina'];
const PRODUCTION = ['master', 'administración', 'oficina', 'taller'];
const MANAGEMENT = ['master', 'administración'];

const routeables = [
    { name: 'Dashboard', route: 'dashboard', icon: Home, roles: null },
    { name: 'Combos', route: 'combos.index', icon: Group, roles: SALES },
    { name: 'Productos', route: 'products.index', icon: Package, roles: SALES },
    {
        name: 'Pedidos',
        route: 'orders.index',
        icon: ShoppingCart,
        roles: SALES,
    },
    { name: 'Escuelas', route: 'schools.index', icon: School, roles: SALES },
    {
        name: 'Seguimiento',
        route: 'tracking.index',
        icon: Rss,
        roles: PRODUCTION,
    },
    {
        name: 'Stockeables',
        route: 'stockables.index',
        icon: PackageOpen,
        roles: PRODUCTION,
    },
    {
        name: 'Reciclaje',
        route: 'recycling.index',
        icon: Recycle,
        roles: PRODUCTION,
    },
    {
        name: 'Etapas',
        route: 'production-statuses.index',
        icon: ListOrdered,
        roles: MANAGEMENT,
    },
    { name: 'Usuarios', route: 'users.index', icon: Users, roles: ['master'] },
] as const;

export function AppSidebar() {
    const { url, props } = usePage();
    const userRoles: string[] = props.auth?.roles ?? [];

    const canSee = (roles: readonly string[] | null) =>
        roles === null || roles.some((role) => userRoles.includes(role));

    const isActive = (path: string) => {
        const [base] = url.split('/').filter((s) => s.length > 1);

        return route(path).includes(base);
    };

    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {routeables
                                .filter((routeable) => canSee(routeable.roles))
                                .map((routeable) => (
                                    <SidebarMenuItem key={routeable.name}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(routeable.route)}
                                        >
                                            <Link href={route(routeable.route)}>
                                                <routeable.icon />
                                                <span>{routeable.name}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
