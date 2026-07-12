import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export function StockAlertsCard({ stockAlerts }: { stockAlerts: Stockable[] }) {
    return (
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
                        Sin alertas: todos los insumos están por encima de su
                        umbral.
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
    );
}
