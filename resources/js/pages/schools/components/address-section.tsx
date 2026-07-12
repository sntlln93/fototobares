import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type SetDataAction } from '@inertiajs/react';
import { type SchoolFormData } from '../form';

interface AddressSectionProps {
    data: SchoolFormData;
    setData: SetDataAction<SchoolFormData>;
    getError: (path: string) => string;
}

export function AddressSection({
    data,
    setData,
    getError,
}: AddressSectionProps) {
    return (
        <section className="mt-6">
            <h2>
                Dirección <span className="italic">(opcional)</span>
            </h2>
            <div className="flex gap-6">
                <div className="w-full">
                    <Label htmlFor="address.street">Calle</Label>

                    <Input
                        id="address.street"
                        name="address.street"
                        value={data.address.street}
                        onChange={(e) =>
                            setData('address', {
                                ...data.address,
                                street: e.target.value,
                            })
                        }
                        className="mt-1 block w-full"
                        placeholder="Calle"
                    />

                    <InputError
                        message={getError('address.street')}
                        className="mt-2"
                    />
                </div>

                <div className="w-full">
                    <Label htmlFor="address.number">Altura</Label>

                    <Input
                        id="address.number"
                        name="address.number"
                        value={data.address.number}
                        onChange={(e) =>
                            setData('address', {
                                ...data.address,
                                number: e.target.value,
                            })
                        }
                        className="mt-1 block w-full"
                        placeholder="Altura"
                    />

                    <InputError
                        message={getError('address.number')}
                        className="mt-2"
                    />
                </div>
            </div>

            <div className="mt-6 flex gap-6">
                <div className="w-full">
                    <Label htmlFor="address.neighborhood">Barrio</Label>

                    <Input
                        id="address.neighborhood"
                        name="address.neighborhood"
                        value={data.address.neighborhood}
                        onChange={(e) =>
                            setData('address', {
                                ...data.address,
                                neighborhood: e.target.value,
                            })
                        }
                        className="mt-1 block w-full"
                        placeholder="Barrio"
                    />

                    <InputError
                        message={getError('address.neighborhood')}
                        className="mt-2"
                    />
                </div>

                <div className="w-full">
                    <Label htmlFor="address.city">Localidad</Label>

                    <Input
                        id="address.city"
                        name="address.city"
                        value={data.address.city}
                        onChange={(e) =>
                            setData('address', {
                                ...data.address,
                                city: e.target.value,
                            })
                        }
                        className="mt-1 block w-full"
                        placeholder="Localidad"
                    />

                    <InputError
                        message={getError('address.city')}
                        className="mt-2"
                    />
                </div>
            </div>
        </section>
    );
}
