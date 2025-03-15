import { Toaster } from '@/components/ui/sonner';
import useCsrfAutoRefresh from '@/hooks/use-csrf-auto-refresh';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    useCsrfAutoRefresh();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster swipeDirections={['right']} position="top-right" />
        </AppLayoutTemplate>
    );
}
