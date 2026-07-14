import { expect, test } from '@playwright/test';

// Order #2 (Bruno Díaz / Thiago): the Clásico was glued, so 2 MDF boards were
// deducted and 1 "armado" was produced — cancelling it back to stock must
// return the boards and subtract the armado back out; the carpeta goes to
// the recycling bin.
test('cancelling returns supplies to stock and lists recycled products', async ({
    page,
}) => {
    await page.goto('/orders/2');

    await page.getByRole('button', { name: 'Cancelar pedido' }).click();
    const modal = page.getByRole('dialog');
    await expect(modal.getByText('Cancelar pedido #2')).toBeVisible();

    // Clásico → stock; the carpeta keeps the default (reciclaje)
    await modal
        .locator('li')
        .filter({ hasText: 'Clásico' })
        .getByRole('combobox')
        .click();
    await page.getByRole('option', { name: 'Stock' }).click();
    await modal.getByRole('button', { name: 'Confirmar cancelación' }).click();
    await expect(page.getByText('Pedido cancelado').first()).toBeVisible();

    // The carpeta shows up in the recycling module
    await page.goto('/recycling');
    await expect(
        page
            .getByRole('row')
            .filter({ hasText: 'Thiago' })
            .filter({ hasText: 'Carpeta' }),
    ).toBeVisible();

    // The MDF boards came back as a return movement
    await page.goto('/stock-movements');
    await expect(
        page
            .getByRole('row')
            .filter({ hasText: 'Planchas de MDF' })
            .filter({ hasText: 'Devolución por cancelación' })
            .first(),
    ).toBeVisible();

    // The armado it had produced is subtracted back out
    await expect(
        page
            .getByRole('row')
            .filter({ hasText: 'Murales armados' })
            .filter({ hasText: 'Ajuste por cancelación' })
            .first(),
    ).toBeVisible();
});
