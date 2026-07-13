import { expect, test } from '@playwright/test';

// Order #9 (Irina Sosa / Simón): a single carpeta, nothing produced yet and
// untouched by other specs. Priority is set from the order page (#108) and the
// workshop only reads it in /tracking. The badge lookups are exact: "Prioridad"
// is a substring of the "Quitar prioridad" button.
test('prioritize a detail from the order page and see it in tracking', async ({
    page,
}) => {
    await page.goto('/orders/9');

    await page.getByRole('button', { name: 'Priorizar' }).click();
    await expect(page.getByText('Prioridad', { exact: true })).toBeVisible();

    await page.goto('/tracking');
    await expect(
        page
            .getByRole('row')
            .filter({ hasText: 'Simón' })
            .getByText('Prioridad', { exact: true }),
    ).toBeVisible();

    await page.goto('/orders/9');
    await page.getByRole('button', { name: 'Quitar prioridad' }).click();
    await expect(page.getByText('Prioridad', { exact: true })).toBeHidden();
});
