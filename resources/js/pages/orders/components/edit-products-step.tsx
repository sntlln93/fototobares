import InputError from '@/components/input-error';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { EditOrderController } from '../hooks/use-edit-order';

interface EditProductsStepProps {
    form: EditOrderController;
    products: Order['products'];
}

export function EditProductsStep({ form, products }: EditProductsStepProps) {
    const { errors, toStep } = form;

    return (
        <AccordionItem value="products">
            <AccordionTrigger onClick={toStep('products')}>
                <div className="flex items-center gap-2">
                    Productos ({products.length})
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-1">
                <ul className="space-y-2">
                    {products.map((product) => (
                        <li
                            key={product.id}
                            className="flex items-center justify-between rounded-md border border-input bg-background px-4 py-2"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {product.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {product.type?.name}
                                </p>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="warning" size="icon" disabled>
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    disabled
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>

                <InputError message={errors.order_details} />

                <div className="mt-6 flex flex-col justify-end gap-3 md:flex-row">
                    <Button variant="outline" onClick={toStep('client')}>
                        Anterior
                    </Button>

                    <Button onClick={toStep('order')}>Siguiente</Button>
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
