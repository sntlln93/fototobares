import { expect, test } from '@playwright/test';

// Smoke over the per-product tracking board, on order #1's details (Ana
// Suárez / Valentina — nothing produced yet, untouched by other specs).
// Priority is read-only here: it is set from the order page (see
// priority.spec.ts).
test('quick advance, batch update and priority badge', async ({ page }) => {
    await page.goto('/tracking');

    // Seeded priority: Lola's mural broke and has to be remade
    await expect(
        page
            .getByRole('row')
            .filter({ hasText: 'Lola' })
            .getByText('Prioridad'),
    ).toBeVisible();

    // Quick advance: Valentina's carpeta jumps to its next stage
    await page
        .getByRole('row')
        .filter({ hasText: 'Valentina' })
        .filter({ hasText: 'Carpeta' })
        .locator('button[title^="Pasar a"]')
        .click();
    await expect(page.getByText(/Estado actualizado/).first()).toBeVisible();

    // Batch: select Valentina's medalla and apply a stage to the selection
    const group = page
        .locator('div.rounded-xl')
        .filter({ has: page.getByRole('heading', { name: 'Medalla' }) });
    await group
        .getByRole('row')
        .filter({ hasText: 'Valentina' })
        .getByRole('checkbox')
        .check();
    await group.getByRole('combobox').click();
    await page.getByRole('option').first().click();
    await group.getByRole('button', { name: 'Aplicar a 1' }).click();
    await expect(page.getByText(/Estado actualizado a/)).toBeVisible();
});
