import { defineConfig, devices } from '@playwright/test';

// Local runs hit the Sail server at http://localhost and reset the database
// through `./vendor/bin/sail artisan` (see e2e/global.setup.ts). CI overrides
// both via E2E_BASE_URL / E2E_ARTISAN and lets Playwright boot
// `php artisan serve` itself.
export default defineConfig({
    testDir: './e2e',
    // Specs share one freshly-seeded database per run and each one mutates
    // orders no other spec touches — keep them sequential.
    workers: 1,
    timeout: 60_000,
    expect: { timeout: 10_000 },
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? 'line' : 'list',
    use: {
        baseURL: process.env.E2E_BASE_URL ?? 'http://localhost',
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'setup', testMatch: /global\.setup\.ts/ },
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'e2e/.auth/master.json',
            },
            dependencies: ['setup'],
        },
    ],
    webServer: process.env.CI
        ? {
              command: 'php artisan serve --host=127.0.0.1 --port=8000',
              url: 'http://127.0.0.1:8000',
              timeout: 60_000,
          }
        : undefined,
});
