import { test as setup } from '@playwright/test';
import { execSync } from 'node:child_process';
import { USERS, login } from './helpers';

// One fresh demo database per run. Every spec relies on the DemoSeeder
// dataset and mutates only orders no other spec touches, so a single reset
// is enough with workers: 1.
setup('reset the database and sign in as master', async ({ page }) => {
    const artisan = process.env.E2E_ARTISAN ?? './vendor/bin/sail artisan';
    execSync(`${artisan} migrate:fresh --seed`, {
        stdio: 'inherit',
        timeout: 300_000,
    });

    await login(page, USERS.master);
    await page.context().storageState({ path: 'e2e/.auth/master.json' });
});
