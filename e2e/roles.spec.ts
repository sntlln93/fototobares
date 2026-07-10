import { expect, test } from '@playwright/test';
import { USERS, login } from './helpers';

test.use({ storageState: { cookies: [], origins: [] } });

const CASES = [
    {
        role: 'oficina',
        sees: ['Pedidos', 'Seguimiento'],
        hidden: ['Etapas', 'Usuarios'],
        forbidden: '/users',
    },
    {
        role: 'editor',
        sees: ['Dashboard'],
        hidden: ['Pedidos', 'Seguimiento', 'Usuarios'],
        forbidden: '/tracking',
    },
    {
        role: 'taller',
        sees: ['Seguimiento', 'Stockeables', 'Reciclaje'],
        hidden: ['Pedidos', 'Etapas', 'Usuarios'],
        forbidden: '/orders',
    },
] as const;

for (const { role, sees, hidden, forbidden } of CASES) {
    test(`${role}: sidebar matches the role and ${forbidden} is a 403`, async ({
        page,
    }) => {
        await login(page, USERS[role]);

        const sidebar = page.locator('[data-sidebar="sidebar"]').first();
        for (const item of sees) {
            await expect(
                sidebar.getByRole('link', { name: item }),
            ).toBeVisible();
        }
        for (const item of hidden) {
            await expect(sidebar.getByRole('link', { name: item })).toHaveCount(
                0,
            );
        }

        const response = await page.goto(forbidden);
        expect(response?.status()).toBe(403);
    });
}
