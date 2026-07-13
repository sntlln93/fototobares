import AppLogo from '@/components/app-logo';
import { Breadcrumbs } from '@/features/breadcrumbs';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { DesktopNav } from './app-header/desktop-nav';
import { HeaderActions } from './app-header/header-actions';
import { MobileNav } from './app-header/mobile-nav';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    return (
        <>
            <div className="border-b border-sidebar-border/80">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    <MobileNav />

                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-2"
                    >
                        <AppLogo />
                    </Link>

                    <DesktopNav currentUrl={page.url} />

                    <HeaderActions user={auth.user} />
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
