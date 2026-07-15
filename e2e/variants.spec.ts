import { expect, test } from '@playwright/test';

// Order #12 (Lucía Ferreyra, Sala de 5) carries a Banda with its Talle
// variant left pending at order time — the exact case #113 covers.
test('defines a pending variant from the order page and it persists', async ({
    page,
}) => {
    await page.goto('/orders/12');

    await expect(page.getByText('A definir: Talle')).toBeVisible();

    await page.getByText('Editar variantes').click();
    await expect(page.getByText('Editar variantes de Banda')).toBeVisible();

    const trigger = page.getByRole('combobox', { name: 'Talle' });
    await trigger.click();
    await page.getByRole('option', { name: 'M' }).click();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    // The dialog closes client-side on submit, but Headless UI keeps it
    // mounted for its 200ms leave transition — wait for it to actually be
    // gone before asserting on page text, or its own Select trigger (still
    // showing "M") makes the badge assertion below ambiguous.
    await expect(page.locator('#modal')).toBeHidden();

    await expect(page.getByText('Variante actualizada')).toBeVisible();
    await expect(page.getByText('A definir: Talle')).toHaveCount(0);
    await expect(page.getByText('M', { exact: true })).toBeVisible();

    await page.reload();
    await expect(page.getByText('M', { exact: true })).toBeVisible();
    await expect(page.getByText('A definir: Talle')).toHaveCount(0);
});
