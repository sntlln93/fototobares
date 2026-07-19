import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { OverdueOrdersCard } from './dashboard/components/overdue-orders-card';
import { ProductionCard } from './dashboard/components/production-card';
import { ProductionStatsCard } from './dashboard/components/production-stats-card';
import { StatsGrid } from './dashboard/components/stats-grid';
import { StockAlertsCard } from './dashboard/components/stock-alerts-card';
import {
    Metrics,
    OverdueOrder,
    ProductionStat,
    useDashboard,
} from './dashboard/hooks/use-dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
];

export default function Dashboard({
    metrics,
    overdueOrders,
    stockAlerts,
    productionStats,
}: PageProps<{
    metrics: Metrics;
    overdueOrders: OverdueOrder[];
    stockAlerts: Stockable[];
    productionStats: ProductionStat[];
}>) {
    const { production, productionTotal } = useDashboard(metrics);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <section className="flex flex-col gap-6 p-6">
                <StatsGrid
                    metrics={metrics}
                    productionTotal={productionTotal}
                />

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <ProductionCard
                        production={production}
                        productionTotal={productionTotal}
                    />
                    <StockAlertsCard stockAlerts={stockAlerts} />
                </div>

                <ProductionStatsCard productionStats={productionStats} />

                <OverdueOrdersCard overdueOrders={overdueOrders} />
            </section>
        </AppLayout>
    );
}
