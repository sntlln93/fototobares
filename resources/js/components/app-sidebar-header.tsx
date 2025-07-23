import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumbs } from '@/features/breadcrumbs';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { buttonVariants } from './ui/button';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ml-auto">
                <Link
                    href={route('orders.create')}
                    className={buttonVariants({
                        variant: 'secondary',
                        size: 'sm',
                    })}
                >
                    Vender
                </Link>
            </div>
        </header>
    );
}
