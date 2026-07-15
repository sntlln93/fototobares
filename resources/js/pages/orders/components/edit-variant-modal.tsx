import InputError from '@/components/input-error';
import { Modal } from '@/components/modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { FormEventHandler } from 'react';
import { EditVariantFormController } from '../hooks/use-edit-variant-form';

// Radix Select forbids an empty string value, so "left pending" needs a
// sentinel that gets mapped back to null before it reaches the form data
const PENDING_SENTINEL = '__pending__';

export function EditVariantModal({
    show,
    onClose,
    product,
    form,
}: {
    show: boolean;
    onClose: () => void;
    product: OrderProduct;
    form: EditVariantFormController;
}) {
    const { data, setData, errors, processing, submit } = form;

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        submit(e);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Editar variantes de {product.name}
                </h2>

                {(product.variants ?? []).map((definition) => (
                    <div className="mt-4" key={definition.label}>
                        <Label htmlFor={`variant-${definition.label}`}>
                            {definition.label}
                        </Label>
                        <Select
                            value={
                                data.variant[definition.label] ??
                                PENDING_SENTINEL
                            }
                            onValueChange={(value) =>
                                setData('variant', {
                                    ...data.variant,
                                    [definition.label]:
                                        value === PENDING_SENTINEL
                                            ? null
                                            : value,
                                })
                            }
                        >
                            <SelectTrigger
                                id={`variant-${definition.label}`}
                                className="mt-1 w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {definition.nullable && (
                                    <SelectItem value={PENDING_SENTINEL}>
                                        Definir después
                                    </SelectItem>
                                )}
                                {definition.options.map((option) => (
                                    <SelectItem
                                        key={option.label}
                                        value={option.label}
                                    >
                                        <span className="flex items-center gap-2">
                                            {option.color && (
                                                <span
                                                    className="h-3 w-3 rounded-full border border-black/10"
                                                    style={{
                                                        backgroundColor:
                                                            option.color,
                                                    }}
                                                />
                                            )}
                                            {option.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
                <InputError message={errors.variant} className="mt-2" />

                <div className="mt-6 grid grid-cols-[1fr_1fr] gap-2">
                    <Button
                        disabled={processing}
                        variant="outline"
                        onClick={onClose}
                        type="button"
                    >
                        Cancelar
                    </Button>

                    <Button disabled={processing}>
                        {processing ? <Spinner /> : 'Guardar cambios'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
