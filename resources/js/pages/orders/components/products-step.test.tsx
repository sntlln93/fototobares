import { Accordion } from '@/components/ui/accordion';
import { formatPrice } from '@/lib/utils';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderFormController } from '../hooks/use-create-order-form';
import { ProductsStep } from './products-step';

const makeForm = (
    overrides: Partial<OrderFormController> = {},
): OrderFormController =>
    ({
        data: { order_details: [] },
        errors: {},
        errorFlags: {},
        toStep: () => vi.fn(),
        comboDropdownOpen: false,
        setComboDropdownOpen: vi.fn(),
        productDropdownOpen: false,
        setProductDropdownOpen: vi.fn(),
        handleAddCombo: vi.fn(),
        handleAddProduct: vi.fn(),
        handleEditProduct: vi.fn(),
        handleRemoveProduct: vi.fn(),
        handleRemoveCombo: vi.fn(),
        breakdown: { lines: [], total: 0 },
        ...overrides,
    }) as unknown as OrderFormController;

const renderProductsStep = (form: OrderFormController) =>
    render(
        <Accordion type="single" collapsible defaultValue="products">
            <ProductsStep form={form} products={[]} combos={[]} />
        </Accordion>,
    );

// RTL's default text matcher collapses whitespace (including formatPrice's
// non-breaking space) on the DOM side only, so the expected string needs the
// same normalization to compare equal.
const totalText = (amount: number) =>
    `Total: ${formatPrice(amount)}`.replace(/\s+/g, ' ');

describe('ProductsStep', () => {
    it('renders the chosen-products total from breakdown.total', () => {
        const form = makeForm({ breakdown: { lines: [], total: 15000 } });

        renderProductsStep(form);

        expect(screen.getByText(totalText(15000))).toBeTruthy();
    });

    it('shows a zero total when no products are chosen', () => {
        // makeForm already defaults to an empty order_details / total cart
        const form = makeForm();

        renderProductsStep(form);

        expect(screen.getByText(totalText(0))).toBeTruthy();
    });

    it('reflects an updated total after re-render (add/remove reactivity)', () => {
        const form = makeForm({ breakdown: { lines: [], total: 10000 } });

        const { rerender } = renderProductsStep(form);

        expect(screen.getByText(totalText(10000))).toBeTruthy();

        const updatedForm = makeForm({
            breakdown: { lines: [], total: 25000 },
        });

        rerender(
            <Accordion type="single" collapsible defaultValue="products">
                <ProductsStep form={updatedForm} products={[]} combos={[]} />
            </Accordion>,
        );

        expect(screen.getByText(totalText(25000))).toBeTruthy();
        expect(screen.queryByText(totalText(10000))).toBeNull();
    });
});
