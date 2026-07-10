import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatPrice } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Banknote,
    Factory,
    ShoppingCart,
    Wallet,
} from 'lucide-react';

type Metrics = {
    sales_this_month: { count: number; total: number };
    collected_this_month: number;
    outstanding_balance: number;
    production: {
        sin_empezar: number;
        en_produccion: number;
        listo_para_entregar: number;
    };
};

type OverdueOrder = {
    id: number;
    client: string;
    child_name: string | null;
    school: string;
    due_date: string;
    balance: number;
};

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
}: PageProps<{
    metrics: Metrics;
    overdueOrders: OverdueOrder[];
    stockAlerts: Stockable[];
}>) {
    const production = metrics.production;
    const productionTotal =
        production.sin_empezar +
        production.en_produccion +
        production.listo_para_entregar;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <section className="flex flex-col gap-6 p-6">
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

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">
                                Producción
                            </CardTitle>
                            <CardDescription>
                                Productos pendientes de entrega, por etapa.{' '}
                                <Link
                                    href={route('tracking.index')}
                                    className="underline underline-offset-2"
                                >
                                    Ir a seguimiento
                                </Link>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <ProductionRow
                                label="Sin empezar"
                                count={production.sin_empezar}
                                total={productionTotal}
                                barClass="bg-gray-400"
                            />
                            <ProductionRow
                                label="En producción"
                                count={production.en_produccion}
                                total={productionTotal}
                                barClass="bg-blue-500"
                            />
                            <ProductionRow
                                label="Listo para entregar"
                                count={production.listo_para_entregar}
                                total={productionTotal}
                                barClass="bg-green-500"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Alertas de stock
                            </CardTitle>
                            <CardDescription>
                                Insumos en o por debajo de su umbral de alerta
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {stockAlerts.length === 0 ? (
                                <CardDescription>
                                    Sin alertas: todos los insumos están por
                                    encima de su umbral.
                                </CardDescription>
                            ) : (
                                <ul className="space-y-2">
                                    {stockAlerts.map((stockable) => (
                                        <li
                                            key={stockable.id}
                                            className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-md border border-input px-3 py-2 text-sm"
                                        >
                                            <span>{stockable.name}</span>
                                            <Badge
                                                variant="destructive"
                                                className="max-w-full min-w-0"
                                            >
                                                <span className="truncate">
                                                    {`${stockable.quantity} (${stockable.unit}) — alerta en ${stockable.alert_at}`}
                                                </span>
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">
                            Pedidos vencidos con saldo pendiente
                        </CardTitle>
                        <CardDescription>
                            Pasó el primer vencimiento y todavía no están
                            pagados al 100%
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {overdueOrders.length === 0 ? (
                            <CardDescription>
                                No hay pedidos vencidos con saldo pendiente.
                            </CardDescription>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Escuela</TableHead>
                                        <TableHead>Vencimiento</TableHead>
                                        <TableHead>Saldo</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {overdueOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <Link
                                                    href={route('orders.show', {
                                                        order: order.id,
                                                    })}
                                                    className="underline-offset-2 hover:underline"
                                                >
                                                    #{order.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {order.client}
                                                {order.child_name
                                                    ? ` (${order.child_name})`
                                                    : ''}
                                            </TableCell>
                                            <TableCell>
                                                {order.school}
                                            </TableCell>
                                            <TableCell>
                                                {order.due_date}
                                            </TableCell>
                                            <TableCell className="font-semibold text-amber-600">
                                                {formatPrice(order.balance)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </section>
        </AppLayout>
    );
}

function StatCard({
    title,
    value,
    hint,
    icon,
}: {
    title: string;
    value: string;
    hint: string;
    icon: React.ReactNode;
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                    {icon}
                    {title}
                </CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{hint}</CardDescription>
            </CardContent>
        </Card>
    );
}

function ProductionRow({
    label,
    count,
    total,
    barClass,
}: {
    label: string;
    count: number;
    total: number;
    barClass: string;
}) {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span>{label}</span>
                <span className="text-gray-500">{count}</span>
            </div>
            <div
                className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                role="progressbar"
                aria-label={label}
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
