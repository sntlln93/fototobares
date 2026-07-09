import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { capitalize } from '@/lib/utils';
import { useState } from 'react';
import {
    ProductStagesRow,
    StatusRow,
    StockableOption,
    useStatusActions,
} from '../hooks/use-status-actions';
import { AddStatusForm } from './add-status-form';
import { ConsumptionDialog } from './consumption-dialog';
import { DeleteStatusConfirmation } from './delete-confirmation';
import { StatusItem } from './status-item';

export function ProductCard({
    product,
    stockables,
}: {
    product: ProductStagesRow;
    stockables: StockableOption[];
}) {
    const { move, rename, add, attachStockable, detachStockable } =
        useStatusActions(product);
    const [deletableStatus, setDeletableStatus] = useState<StatusRow | null>(
        null,
    );
    const [consumptionStatusId, setConsumptionStatusId] = useState<
        number | null
    >(null);

    // Re-derived from props so the dialog reflects fresh data after
    // each attach/detach round trip
    const consumptionStatus =
        product.statuses.find((status) => status.id === consumptionStatusId) ??
        null;

    return (
        <Card>
            {deletableStatus && (
                <DeleteStatusConfirmation
                    status={deletableStatus}
                    show={Boolean(deletableStatus)}
                    onClose={() => setDeletableStatus(null)}
                />
            )}

            {consumptionStatus && (
                <ConsumptionDialog
                    status={consumptionStatus}
                    stockables={stockables}
                    onAttach={(stockableId, quantity) =>
                        attachStockable(
                            consumptionStatus.id,
                            stockableId,
                            quantity,
                        )
                    }
                    onDetach={(stockableId) =>
                        detachStockable(consumptionStatus.id, stockableId)
                    }
                    onClose={() => setConsumptionStatusId(null)}
                />
            )}

            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    {product.name}
                    {product.type && (
                        <Badge variant="secondary">
                            {capitalize(product.type)}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {product.statuses.map((status, index) => (
                    <StatusItem
                        key={status.id}
                        status={status}
                        isFirst={index === 0}
                        isLast={index === product.statuses.length - 1}
                        isOnly={product.statuses.length === 1}
                        onMoveUp={() => move(index, -1)}
                        onMoveDown={() => move(index, 1)}
                        onRename={(name, onSuccess) =>
                            rename(status.id, name, onSuccess)
                        }
                        onEditConsumption={() =>
                            setConsumptionStatusId(status.id)
                        }
                        onDelete={() => setDeletableStatus(status)}
                    />
                ))}

                <AddStatusForm onAdd={add} />
            </CardContent>
        </Card>
    );
}
