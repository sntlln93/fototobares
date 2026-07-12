import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Link } from '@inertiajs/react';
import { ProductFormController } from '../hooks/use-product-form';
import { ProductVariantsFields } from './product-variants-fields';

export function ProductForm({
    form,
    product_types,
    typeSelectProps,
    submitLabel,
    renderColorLabel,
}: {
    form: ProductFormController;
    product_types: ProductType[];
    typeSelectProps: { value?: string; defaultValue?: string };
    submitLabel: string;
    renderColorLabel?: (value: Color) => string;
}) {
    const { data, setData, processing, errors, submit } = form;

    return (
        <form onSubmit={submit} className="p-6">
            <div className="mt-6">
                <Label htmlFor="name">Nombre</Label>

                <Input
                    id="name"
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="Nombre"
                />

                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="mt-6">
                <Label htmlFor="product_type_id">Tipo</Label>

                <Select
                    name="product_type_id"
                    onValueChange={(value) =>
                        setData('product_type_id', Number(value))
                    }
                    {...typeSelectProps}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {product_types.map((type) => (
                            <SelectItem key={type.id} value={String(type.id)}>
                                {type.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <InputError message={errors.product_type_id} className="mt-2" />
            </div>

            <div className="mt-6">
                <Label htmlFor="unit_price">Precio unitario</Label>

                <Input
                    id="unit_price"
                    type="number"
                    name="unit_price"
                    value={data.unit_price}
                    onChange={(e) => setData('unit_price', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="Cantidad en números enteros"
                />

                <InputError message={errors.unit_price} className="mt-2" />
            </div>
            <div className="mt-6">
                <Label htmlFor="max_payments">Cantidad máxima de cuotas</Label>

                <Input
                    id="max_payments"
                    type="number"
                    name="max_payments"
                    value={data.max_payments}
                    onChange={(e) => setData('max_payments', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="Cantidad en números enteros"
                />

                <InputError message={errors.max_payments} className="mt-2" />
            </div>

            {data.product_type_id === 1 ? (
                <ProductVariantsFields
                    form={form}
                    renderColorLabel={renderColorLabel}
                />
            ) : undefined}

            <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" asChild>
                    <Link href={route('products.index')}>Cancelar</Link>
                </Button>

                <Button disabled={processing}>{submitLabel}</Button>
            </div>
        </form>
    );
}
