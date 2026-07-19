import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ProductionStat } from '../hooks/use-dashboard';

export function ProductionStatsCard({
    productionStats,
}: {
    productionStats: ProductionStat[];
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">
                    Producción por producto y variante
                </CardTitle>
                <CardDescription>
                    Totales actuales de unidades activas, agrupadas por producto
                    y por variante.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {productionStats.length === 0 ? (
                    <CardDescription>
                        Sin unidades en producción por el momento.
                    </CardDescription>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {productionStats.map((stat) => (
                            <div
                                key={stat.product}
                                className="min-w-0 rounded-md border border-input p-3"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="truncate font-medium">
                                        {stat.product}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {stat.total}
                                    </span>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {stat.variants.map((variant) => (
                                        <li
                                            key={variant.label}
                                            className="flex items-center justify-between gap-2 text-sm text-muted-foreground"
                                        >
                                            <span className="truncate">
                                                {variant.label}
                                            </span>
                                            <span>{variant.count}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
