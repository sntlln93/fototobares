import { formatPrice } from '@/lib/utils';
import { Banknote, Factory, ShoppingCart, Wallet } from 'lucide-react';
import { Metrics } from '../hooks/use-dashboard';
import { StatCard } from './stat-card';

export function StatsGrid({
    metrics,
    productionTotal,
}: {
    metrics: Metrics;
    productionTotal: number;
}) {
    const production = metrics.production;

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
                title="Ventas del mes"
                icon={<ShoppingCart className="h-5 w-5" />}
                value={String(metrics.sales_this_month.count)}
                hint={`${formatPrice(metrics.sales_this_month.total)} vendidos`}
            />
            <StatCard
                title="Cobrado este mes"
                icon={<Banknote className="h-5 w-5" />}
                value={formatPrice(metrics.collected_this_month)}
                hint="Pagos registrados en el mes"
            />
            <StatCard
                title="Saldo por cobrar"
                icon={<Wallet className="h-5 w-5" />}
                value={formatPrice(metrics.outstanding_balance)}
                hint="Total vendido menos cobrado"
            />
            <StatCard
                title="En fabricación"
                icon={<Factory className="h-5 w-5" />}
                value={String(productionTotal)}
                hint={`${production.listo_para_entregar} listos para entregar`}
            />
        </div>
    );
}
