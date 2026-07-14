import { expect, test } from '@playwright/test';
import {
    addSimpleProduct,
    fillClientStep,
    fillSchoolStep,
    nextStep,
    stepTriggers,
} from './helpers';

// Full draft round-trip through the UI: save a partial order as draft,
// preload it via "Ver" and turn it into a real order, which consumes it.
test('draft: save, preload via "Ver", saving the order consumes it', async ({
    page,
}) => {
    await page.goto('/orders/create');
    await fillSchoolStep(page);
    await fillClientStep(page, {
        name: 'Cliente Borrador E2E',
        phone: '3804888888',
        child: 'Guada',
    });
    // Skip products; drafts can be partial
    await nextStep(page);
    await page.locator('#total_price').fill('30000');
    await page.locator('#payment_plan').fill('1');
    await page.getByRole('button', { name: 'Guardar como borrador' }).click();

    await page.waitForURL('/drafts');
    const row = page
        .getByRole('row')
        .filter({ hasText: 'Cliente Borrador E2E' });
    await expect(row).toBeVisible();

    // "Ver" preloads everything into the create form
    await row.getByRole('button', { name: 'Ver', exact: true }).click();
    await page.waitForURL(/\/orders\/create/);
    await expect(page.getByText(/Borrador #\d+ cargado/)).toBeVisible();
    await expect(
        stepTriggers(page).filter({ hasText: 'Escuela Normal' }).first(),
    ).toBeVisible();

    await stepTriggers(page).filter({ hasText: 'Cliente' }).first().click();
    await expect(page.locator('#name')).toHaveValue('Cliente Borrador E2E');

    // Complete it and save for real
    await stepTriggers(page).filter({ hasText: 'Productos' }).first().click();
    await addSimpleProduct(page, 'Taza', 'Taza de Guada');
    await stepTriggers(page).filter({ hasText: 'Pedido' }).first().click();
    // The draft price was typed by hand with an empty cart: adding the taza
    // recalculates the total from the cart (#96), so it becomes its list price
    await expect(page.locator('#total_price')).toHaveValue('12000');
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await page.waitForURL('/orders');

    // The draft was consumed
    await page.goto('/drafts');
    await expect(
        page.getByRole('row').filter({ hasText: 'Cliente Borrador E2E' }),
    ).toHaveCount(0);
});
