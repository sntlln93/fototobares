import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProductIcon } from '@/features/product-icon';
import { capitalize, formatPrice } from '@/lib/utils';
import { Flame, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useEditVariantForm } from '../hooks/use-edit-variant-form';
import { EditVariantModal } from './edit-variant-modal';
import { ProductionStatusControl } from './production-status-control';
import { VariantBadges } from './variant-badges';

export function DetailItem({
    orderId,
    product,
    canPrioritize,
    onTogglePriority,
    firstInstallmentPaid,
    onStatusChange,
    onDisableProduction,
    canEditVariant,
}: {
    orderId: number;
    product: OrderProduct;
    canPrioritize: boolean;
    onTogglePriority: () => void;
    firstInstallmentPaid: boolean;
    onStatusChange: (statusId: number | null) => void;
    onDisableProduction: () => void;
    canEditVariant: boolean;
}) {
    const [showEditVariant, setShowEditVariant] = useState(false);
    const editVariantForm = useEditVariantForm(orderId, product);

    return (
        <div
            key={product.id}
            className="flex items-start gap-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
        >
            <div className="rounded bg-gray-200 p-2 dark:bg-gray-700">
                <ProductIcon
                    type={product.product_type_id}
                    className="h-6 w-6 text-gray-500 dark:text-gray-400"
                />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-black dark:text-white">
                    {product.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                    {capitalize(product.type.name)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {formatPrice(product.unit_price)}
                    </span>
                    <span className="rounded bg-blue-100 px-2 py-1 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                        {product.max_payments} cuotas
                    </span>
                    {product.financed_price && (
                        <span className="rounded bg-green-100 px-2 py-1 text-green-700 dark:bg-green-900 dark:text-green-200">
                            {formatPrice(product.financed_price)} financiado
                        </span>
                    )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                    {product.priority && (
                        <Badge variant="destructive" className="gap-1">
                            <Flame className="h-3 w-3" />
                            Prioridad
                        </Badge>
                    )}
                    {product.recycled_to ? (
                        <Badge variant="destructive">
                            {product.recycled_to === 'stock'
                                ? 'Devuelto a stock'
                                : 'En reciclaje'}
                        </Badge>
                    ) : product.delivered_at ? (
                        <Badge className="bg-green-600 hover:bg-green-600">
                            Entregado
                        </Badge>
                    ) : (
                        <Badge variant="outline">
                            {product.production_enabled
                                ? (product.production_status ?? 'Sin empezar')
                                : 'Sin habilitar'}
                        </Badge>
                    )}
                    {product.note && (
                        <span className="w-full text-xs text-gray-500">
                            Nota: {product.note}
                        </span>
                    )}
                </div>
                <VariantBadges variant={product.variant} />
                {canEditVariant && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-auto px-2 py-1 text-xs"
                        onClick={() => setShowEditVariant(true)}
                    >
                        <Pencil className="mr-1 h-3 w-3" />
                        Editar variantes
                    </Button>
                )}
                {canPrioritize && (
                    <>
                        <ProductionStatusControl
                            product={product}
                            firstInstallmentPaid={firstInstallmentPaid}
                            onChange={onStatusChange}
                            onDisable={onDisableProduction}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-auto px-2 py-1 text-xs"
                            onClick={onTogglePriority}
                        >
                            <Flame className="mr-1 h-3 w-3" />
                            {product.priority
                                ? 'Quitar prioridad'
                                : 'Priorizar'}
                        </Button>
                    </>
                )}
            </div>
            <EditVariantModal
                show={showEditVariant}
                onClose={() => setShowEditVariant(false)}
                product={product}
                form={editVariantForm}
            />
        </div>
    );
}
