---
name: verify
description: Browser verification of UI changes using Playwright and the shared e2e helpers — throwaway specs in e2e/verify/, headed/debug runs, traces, and mobile viewport probes. Use when a UI change needs visual or behavioral confirmation in a real browser.
---

# Verify UI changes in the browser

## How the app is served locally

- If the Vite dev server is running (`sail npm run dev` — check: `public/hot`
  exists), <http://localhost> serves changes via HMR: **no build needed**.
- Without the dev server, Sail serves the **last build**: run
  `sail npm run build` after frontend changes before looking at the browser,
  or your change won't be there.

## Throwaway specs in `e2e/verify/`

Write the check as a Playwright spec in `e2e/verify/` (gitignored — it never
runs in CI) and reuse the shared helpers:

```ts
import { expect, test } from '@playwright/test';
import { login, nextStep, stepTriggers } from '../helpers';
```

```bash
npx playwright test e2e/verify/my-check.spec.ts   # host, not Sail
```

- The `setup` project chains automatically: resets the DB
  (`migrate:fresh --seed`) and signs in as master (`storageState`).
- To keep the current dev data (skip the reset): add `--no-deps` — requires
  `e2e/.auth/master.json` from a previous run.
- Interactive debugging: `--headed` to watch, `--debug` or `await
  page.pause()` to step through, `npx playwright show-trace
  test-results/<dir>/trace.zip` after a failure, `npx playwright codegen
  http://localhost` to record interactions as locators.

Delete the spec when done, or leave it locally — the folder stays out of git.

## Gotchas that still apply on this app

Playwright's auto-wait and strict locators already solve the old harness
problems (animations mid-click, pushState navigation, the ñ in the password).
These remain:

- The login page is `/` — there is no `/login` route. `login()` in
  `e2e/helpers.ts` encodes this and the credentials.
- cmdk comboboxes filter by item **value** (the numeric id) — click the
  `[cmdk-item]` by text, never type to search.
- During the create-order accordion animation two "Siguiente" buttons are
  visible at once — use `nextStep()` (scoped to the open region).
- Assert on the step triggers (`stepTriggers()`), not on page text: Radix
  Select keeps a visually-hidden native `<select>` that pollutes text lookups.
- `input[type=number]` can hold `"02"` after replacing a value — compare with
  `Number(value)`.
- The real order submit requires `payment_plan >= 1`.

## Mobile layout probes

Repo rule: **no page-level horizontal scroll on any viewport**. Probe the
suspect page at the usual widths:

```ts
for (const width of [320, 351, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/the-page');
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    ).toBe(true);
}
```

- For worst-case data, create extreme records with tinker and clean them up
  afterwards: `sail artisan tinker --execute="..."`.
- Known CSS smell: a deep `whitespace-nowrap` propagates its min-content
  through implicit grid tracks — an explicit `grid-cols-1` base cuts it;
  `min-w-0` on an intermediate item is not enough.
