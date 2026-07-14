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

// Issue #160: a draft must show up in its classroom listing with a photo
// number and a "Completar pedido" action, and keep that number once the
// order is completed from there.
test('draft: shows up in the classroom listing and keeps its number once completed', async ({
    page,
}) => {
    await page.goto('/orders/create');
    await fillSchoolStep(page);
    await fillClientStep(page, {
        name: 'Cliente Curso E2E',
        phone: '3804777777',
        child: 'Renata',
    });
    await nextStep(page);
    await page.locator('#total_price').fill('30000');
    await page.locator('#payment_plan').fill('1');
    await page.getByRole('button', { name: 'Guardar como borrador' }).click();
    await page.waitForURL('/drafts');

    // Navigate to the classroom (Escuela Normal / 6TO A) through the UI
    await page.goto('/schools');
    await page
        .getByRole('row', { name: /Escuela Normal/ })
        .getByRole('link')
        .first()
        .click();
    await page.waitForURL(/\/schools\/\d+/);
    await page
        .getByRole('row', { name: /6TO A/i })
        .getByRole('link', { name: 'Ver alumnos' })
        .click();
    await page.waitForURL(/\/classrooms\/\d+/);
    const classroomUrl = page.url();

    const draftRow = page
        .getByRole('row')
        .filter({ hasText: 'Cliente Curso E2E' });
    await expect(draftRow).toBeVisible();
    await expect(draftRow.getByText('Borrador')).toBeVisible();

    const photoNumber = await draftRow.locator('td').first().innerText();
    expect(photoNumber).toMatch(/^\d+$/);

    // Complete the draft into a real order
    await draftRow.getByRole('link', { name: 'Completar pedido' }).click();
    await page.waitForURL(/\/orders\/create/);
    await stepTriggers(page).filter({ hasText: 'Productos' }).first().click();
    await addSimpleProduct(page, 'Taza', 'Taza de Renata');
    await stepTriggers(page).filter({ hasText: 'Pedido' }).first().click();
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await page.waitForURL('/orders');

    // Same classroom row now shows the same number, with "Ver" instead
    await page.goto(classroomUrl);

    const completedRow = page
        .getByRole('row')
        .filter({ hasText: 'Cliente Curso E2E' });
    await expect(completedRow).not.toContainText('Borrador');
    await expect(completedRow.locator('td').first()).toHaveText(photoNumber);
    await expect(completedRow.getByRole('link', { name: 'Ver' })).toBeVisible();

    // Gone from /drafts
    await page.goto('/drafts');
    await expect(
        page.getByRole('row').filter({ hasText: 'Cliente Curso E2E' }),
    ).toHaveCount(0);
});
