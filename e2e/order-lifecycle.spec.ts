import { expect, test } from '@playwright/test';
import {
    addSimpleProduct,
    fillClientStep,
    fillSchoolStep,
    nextStep,
    stepTriggers,
} from './helpers';

// Covers issue #101's regression surface: the in-memory reset of "guardar y
// seguir vendiendo" (school/installments kept, client/products/price cleared)
// and that fresh entries never autofill. Creates real orders for a client no
// seeder uses.
test('full order + "guardar y seguir vendiendo" resets in memory only', async ({
    page,
}) => {
    await page.goto('/orders/create');

    await fillSchoolStep(page);
    await fillClientStep(page, {
        name: 'Cliente E2E',
        phone: '3804999999',
        child: 'Bruno',
    });
    await addSimpleProduct(page, 'Taza', 'Taza de Bruno');
    await expect(
        stepTriggers(page).filter({ hasText: '1 productos' }),
    ).toBeVisible();
    await nextStep(page);

    await page.locator('#total_price').fill('12000');
    await page.locator('#payment_plan').fill('2');
    await page
        .getByRole('button', { name: 'Guardar y seguir vendiendo' })
        .click();
    await expect(page.getByText(/Se conservaron la escuela/)).toBeVisible();

    // Client step reopened and empty, school/installments kept, price at 0
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#phone')).toHaveValue('');
    await expect(page.locator('#child_name')).toHaveValue('');
    await expect(
        stepTriggers(page).filter({ hasText: 'Escuela Normal' }).first(),
    ).toBeVisible();
    await expect(
        stepTriggers(page).filter({ hasText: '0 productos' }),
    ).toBeVisible();

    await stepTriggers(page).filter({ hasText: 'Pedido' }).first().click();
    await expect(page.locator('#total_price')).toHaveValue('0');
    await expect(page.locator('#payment_plan')).toHaveValue('2');

    // The legacy localStorage persistence must stay dead (PR #118)
    expect(
        await page.evaluate(() => localStorage.getItem('orderFormData')),
    ).toBeNull();

    // Reload right after: nothing survives, no autofill toast
    await page.reload();
    await expect(
        stepTriggers(page).filter({ hasText: '0 productos' }),
    ).toBeVisible();
    await expect(
        stepTriggers(page).filter({ hasText: 'Escuela Normal' }),
    ).toHaveCount(0);
    await expect(page.getByText(/cargado/)).toHaveCount(0);
});

test('a fresh entry from the index starts empty', async ({ page }) => {
    await page.goto('/orders');
    await page.locator('a[href*="/orders/create"]').first().click();
    await page.waitForURL('/orders/create');

    await expect(
        stepTriggers(page).filter({ hasText: '0 productos' }),
    ).toBeVisible();
    await expect(
        stepTriggers(page).filter({ hasText: 'Escuela Normal' }),
    ).toHaveCount(0);

    await stepTriggers(page).filter({ hasText: 'Pedido' }).first().click();
    await expect(page.locator('#total_price')).toHaveValue('0');
    await expect(page.locator('#payment_plan')).toHaveValue('0');
});
