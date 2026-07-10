import { expect, test } from '@playwright/test';

// Order #8 (Hernán Luna / Isabella): overdue with a $9.000 balance — receipt
// download, partial payment and the ignorable delivery warning.
test('receipt PNG, partial payment and delivery despite balance', async ({
    page,
}) => {
    await page.goto('/orders/8');

    // The receipt downloads as a rendered PNG (jsPDF is gone, see #51)
    const downloadPromise = page.waitForEvent('download');
    await page
        .getByRole('button', { name: /Descargar comprobante/ })
        .first()
        .click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(
        /^comprobante-pago-\d+-pedido-8\.png$/,
    );

    // Register a partial payment
    await page.getByRole('button', { name: 'Registrar pago' }).click();
    const modal = page.getByRole('dialog');
    await modal.locator('#amount').fill('4000');
    await modal.getByRole('button', { name: 'Registrar pago' }).click();
    await expect(page.getByText(/5\.000/).first()).toBeVisible(); // new balance

    // Delivering with a balance warns, but the warning is ignorable
    await page.getByRole('button', { name: 'Entregar todo' }).click();
    const warning = page.getByRole('dialog');
    await expect(
        warning.getByText('Este pedido no está pagado al 100%'),
    ).toBeVisible();
    await warning.getByRole('button', { name: 'Entregar igualmente' }).click();
    await expect(page.getByText('Entrega registrada')).toBeVisible();
    await expect(page.getByText('Pendientes de entrega')).toHaveCount(0);
    await expect(page.getByText('Entregados', { exact: true })).toBeVisible();
});

// Order #4 (Diego Farías / Benjamín): finished and fully paid — no warning.
test('fully paid order delivers without warning, undo works', async ({
    page,
}) => {
    await page.goto('/orders/4');

    await page.getByRole('button', { name: 'Entregar todo' }).click();
    await expect(page.getByText('Entrega registrada')).toBeVisible();
    await expect(
        page.getByText('Este pedido no está pagado al 100%'),
    ).toHaveCount(0);
    await expect(page.getByText('Pendientes de entrega')).toHaveCount(0);

    await page.getByRole('button', { name: 'Deshacer entrega' }).click();
    await expect(page.getByText('Entrega deshecha')).toBeVisible();
    await expect(page.getByText('Pendientes de entrega')).toBeVisible();
    await expect(page.getByText('Entregados', { exact: true })).toHaveCount(0);
});
