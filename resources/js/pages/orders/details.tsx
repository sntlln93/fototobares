import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { capitalize } from '@/lib/utils';
import { ProductIcon } from '../products/partials/product-icon';

export function Details({ products }: { products: Product[] }) {
    return (
        <Card className="lg:min-w-[400px]">
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

function DetailItem({ product }: { product: Product }) {
    return (
        <div key={product.id} className="flex items-center gap-4">
            <div className="rounded bg-gray-200 p-2">
                <ProductIcon
                    type={product.product_type_id}
                    className="h-6 w-6 text-gray-500"
                />
            </div>
            <div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">
                    {capitalize(product.type.name)}
                </p>
            </div>
        </div>
    );
}
