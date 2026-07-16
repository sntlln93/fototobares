import { fireEvent, render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductForm } from '../components/product-form';
import { FormData } from '../form';
import { useProductForm } from '../hooks/use-product-form';

vi.mock('@inertiajs/react', async () => {
    const { useState } = await import('react');

    // Stateful stand-in: the hook relies on setData re-rendering with the
    // new values, so a static mock would hide bugs
    function useForm(initial: FormData) {
        const [data, setData] = useState(initial);

        return {
            data,
            setData: (
                keyOrData:
                    | keyof FormData
                    | FormData
                    | ((previous: FormData) => FormData),
                value?: unknown,
            ) => {
                if (typeof keyOrData === 'string') {
                    setData((prev) => ({ ...prev, [keyOrData]: value }));
                } else if (typeof keyOrData === 'function') {
                    setData(keyOrData);
                } else {
                    setData(keyOrData);
                }
            },
            post: vi.fn(),
            put: vi.fn(),
            processing: false,
            errors: {},
            clearErrors: vi.fn(),
        };
    }

    return {
        useForm,
        Link: ({ children, href }: { children: ReactNode; href: string }) => (
            <a href={href}>{children}</a>
        ),
    };
});

const productTypes: ProductType[] = [
    { id: 1, name: 'taza' },
    { id: 2, name: 'banda' },
    { id: 3, name: 'mural' },
];

// Harness component that initializes the form and renders ProductForm
function ProductFormHarness({ product }: { product?: Product }) {
    const form = useProductForm(product);

    return (
        <ProductForm
            form={form}
            product_types={productTypes}
            typeSelectProps={{ defaultValue: String(productTypes[0].id) }}
            submitLabel="Guardar"
        />
    );
}

// Radix renders the checkbox as a button, so its state lives in aria-checked
function checkboxState() {
    return screen
        .getByRole('checkbox', { name: 'Incluye foto' })
        .getAttribute('aria-checked');
}

describe('ProductForm - has_photo checkbox', () => {
    // No vi.unstubAllGlobals() here: it would also drop the ResizeObserver
    // stub that setup.ts installs and every Radix component depends on
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal(
            'route',
            (name: string, params?: { product?: number }) =>
                `http://localhost/${name}${params?.product ? `/${params.product}` : ''}`,
        );
    });

    it('renders the "Incluye foto" checkbox unchecked by default', () => {
        render(<ProductFormHarness />);

        expect(screen.getByLabelText('Incluye foto')).toBeTruthy();
        expect(checkboxState()).toBe('false');
    });

    it("reflects an existing product's has_photo value", () => {
        const product: Product = {
            id: 1,
            name: 'Test Product',
            unit_price: 5000,
            financed_price: 6000,
            max_payments: 2,
            product_type_id: 1,
            type: { id: 1, name: 'taza' },
            has_photo: true,
        };

        render(<ProductFormHarness product={product} />);

        expect(checkboxState()).toBe('true');
    });

    it('toggles has_photo when clicked', () => {
        render(<ProductFormHarness />);

        expect(checkboxState()).toBe('false');

        fireEvent.click(screen.getByRole('checkbox', { name: 'Incluye foto' }));

        expect(checkboxState()).toBe('true');

        fireEvent.click(screen.getByRole('checkbox', { name: 'Incluye foto' }));

        expect(checkboxState()).toBe('false');
    });
});
