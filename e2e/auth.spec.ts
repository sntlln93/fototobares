import { expect, test } from '@playwright/test';
import { USERS, login } from './helpers';

test.use({ storageState: { cookies: [], origins: [] } });

test('rejects wrong credentials', async ({ page }) => {
    await page.goto('/');
    await page.locator('#email').fill(USERS.master);
    await page.locator('#password').fill('not-the-password');
    await page.locator('form button').click();

    await expect(page.getByText(/credenciales|records/i)).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
});

test('logs in, redirects /settings and logs out', async ({ page }) => {
    await login(page);

    await page.goto('/settings');
    await page.waitForURL('/settings/password');

    await page.goto('/dashboard');
    await page.getByRole('button', { name: /Agustín Pérez/ }).click();
    await page.getByText('Cerrar sesión').click();
    await page.waitForURL('/');
});
