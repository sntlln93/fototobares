import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Metrics } from '../hooks/use-dashboard';
import { ProductionRow } from './production-row';

export function ProductionCard({
    production,
    productionTotal,
}: {
    production: Metrics['production'];
    productionTotal: number;
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Producción</CardTitle>
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
    );
}
