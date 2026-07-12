import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function QuantityField({
    label,
    value,
    error,
    onChange,
}: {
    label: string;
    value?: number;
    error?: string;
    onChange: (quantity: number) => void;
}) {
    return (
        <section className="full-w my-2">
            <Label htmlFor="quantity">{label}</Label>

            <div className="flex flex-1 gap-2">
                <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min={0}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="h-10"
                />
            </div>

            <InputError message={error} className="mt-2" />
        </section>
    );
}
