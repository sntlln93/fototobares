import { type Locator, type Page } from '@playwright/test';

export const PASSWORD = 'contraseña';

export const USERS = {
    master: 'agustin@fototobares.com',
    oficina: 'oficina@fototobares.com',
    editor: 'editor@fototobares.com',
    taller: 'taller@fototobares.com',
} as const;

/** The login page is `/` — there is no /login route. */
export async function login(page: Page, email: string = USERS.master) {
    await page.goto('/');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('form button').click();
    await page.waitForURL('/dashboard');
}

/** Open a Radix select and pick an option by text. */
export async function pickOption(
    page: Page,
    trigger: Locator,
    option: string | RegExp,
) {
    await trigger.click();
    await page.getByRole('option', { name: option }).first().click();
}

/**
 * Step triggers of the create-order accordion. School/classroom names and the
 * "N productos" count render there as badges — assert on these instead of
 * page text: the Radix Select keeps a visually-hidden native <select> whose
 * options pollute text lookups.
 */
export function stepTriggers(page: Page) {
    return page.locator('button[data-state]');
}

/**
 * Click the "Siguiente" of the currently-open accordion step. While the
 * accordion animates between steps two of them are visible at once, so the
 * lookup must be scoped to the open region.
 */
export async function nextStep(page: Page) {
    await page
        .locator('[role="region"][data-state="open"]')
        .getByRole('button', { name: 'Siguiente' })
        .click();
}

/** Fill step 1 (school + classroom) of the create-order form. */
export async function fillSchoolStep(page: Page) {
    const combos = page.locator('button[role="combobox"]');
    await pickOption(page, combos.first(), /Escuela Normal/);
    await pickOption(page, combos.nth(1), /6TO A/i);
    await nextStep(page);
}

/** Fill step 2 (client) of the create-order form and move on. */
export async function fillClientStep(
    page: Page,
    client: { name: string; phone: string; child: string },
) {
    await page.locator('#name').fill(client.name);
    await page.locator('#phone').fill(client.phone);
    await page.locator('#child_name').fill(client.child);
    await page
        .locator('input[name="attended_photo_session"][value="true"]')
        .click();
    await nextStep(page);
}

/**
 * Add a product without variants in step 3. The cmdk search input filters by
 * item value (the numeric id), so click the item by text instead of typing.
 */
export async function addSimpleProduct(page: Page, name: string, note: string) {
    await page.getByRole('button', { name: 'Añadir producto' }).click();
    await page.locator('[cmdk-item]', { hasText: name }).first().click();
    await page.locator('#note').fill(note);
    await page.getByRole('button', { name: 'Agregar 1 producto' }).click();
}
