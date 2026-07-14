import { expect, test } from '@playwright/test';

// Order #11 (Karen Ibáñez / Renata): a single clásico with no payments —
// production is gated by the first installment (#106) and no other spec
// touches this order. First installment: 44000 / 4 = 11000.
test('production is enabled from the order page after the first installment', async ({
    page,
}) => {
    // Not in tracking and not enableable while nothing is paid
    await page.goto('/tracking');
    await expect(
        page.getByRole('row').filter({ hasText: 'Renata' }),
    ).toHaveCount(0);

    await page.goto('/orders/11');
    await expect(page.getByText('sin habilitar').first()).toBeVisible();
    await expect(
        page.getByText(/se habilita cuando la primera cuota está paga/),
    ).toBeVisible();

    // Paying the first installment unlocks the enable button
    await page.getByRole('button', { name: 'Registrar pago' }).click();
    const modal = page.getByRole('dialog');
    await modal.locator('#amount').fill('11000');
    await modal.getByRole('button', { name: 'Registrar pago' }).click();

    const enable = page.getByRole('button', {
        name: 'Habilitar fabricación',
    });
    await expect(enable).toBeVisible();
    await enable.click();
    await expect(
        page.getByText('Estado de fabricación actualizado'),
    ).toBeVisible();
    await expect(page.getByText('Sin empezar').first()).toBeVisible();

    // The clásico now shows up on the workshop board as pending
    await page.goto('/tracking');
    await expect(
        page.getByRole('row').filter({ hasText: 'Renata' }),
    ).toBeVisible();

    // And its stage can be set right from the order page
    await page.goto('/orders/11');
    await page.getByRole('combobox', { name: /Estado de fabricación/ }).click();
    await page.getByRole('option', { name: 'Impreso' }).click();
    await expect(
        page.getByText('Estado de fabricación actualizado'),
    ).toBeVisible();
});
