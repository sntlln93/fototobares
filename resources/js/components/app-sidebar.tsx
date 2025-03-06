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
    DollarSign,
    Group,
    Home,
    Package,
    PackageOpen,
    Rss,
    School,
    ShoppingCart,
} from 'lucide-react';
import AppLogo from './app-logo';
import { NavFooter } from './nav-footer';
import { NavUser } from './nav-user';

const routeables = [
    { name: 'Dashboard', route: 'dashboard', icon: Home },
    { name: 'Combos', route: 'combos.index', icon: Group },
    { name: 'Productos', route: 'products.index', icon: Package },
    { name: 'Pedidos', route: 'orders.index', icon: ShoppingCart },
    { name: 'Escuelas', route: 'schools.index', icon: School },
    { name: 'Seguimiento', route: 'tracking.index', icon: Rss },
    { name: 'Stockeables', route: 'stockables.index', icon: PackageOpen },
] as const;

export function AppSidebar() {
    const { url } = usePage();

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
                            {routeables.map((routeable) => (
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
                <NavFooter
                    items={[
                        {
                            title: 'Vender',
                            url: route('orders.create'),
                            icon: DollarSign,
                        },
                    ]}
                    className="mt-auto"
                />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
