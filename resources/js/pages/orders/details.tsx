import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { capitalize, formatPrice } from '@/lib/utils';
import { ProductIcon } from '../products/partials/product-icon';

export function Details({ products }: { products: OrderProduct[] }) {
    return (
        <Card className="lg:min-w-100">
            <CardHeader>
                <CardTitle className="text-xl">Detalle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {products.length ? (
                    products.map((product) => (
                        <DetailItem product={product} key={product.id} />
                    ))
                ) : (
                    <CardDescription className="text-center text-gray-500">
                        Algo salió mal, no hay productos en este pedido.
                        Consulte con el administrador.
                    </CardDescription>
                )}
            </CardContent>
        </Card>
    );
}

function DetailItem({ product }: { product: OrderProduct }) {
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
                            {product.production_status ?? 'Sin empezar'}
                        </Badge>
                    )}
                    {product.note && (
                        <span className="w-full text-xs text-gray-500">
                            Nota: {product.note}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
