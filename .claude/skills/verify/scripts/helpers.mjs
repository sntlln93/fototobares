/* Reusable puppeteer harness for browser-verifying this app (Sail + Brave).
 * See SKILL.md for the gotchas encoded here. Usage:
 *
 *   import { run, login, clickByText, ... } from './helpers.mjs';
 *   run('my-check', async (page, check) => {
 *       await login(page);
 *       ...
 *       check('something works', cond, 'extra debug');
 *   });
 */
import puppeteer from 'puppeteer-core';

export const BASE = 'http://localhost';
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

export const settle = (ms = 600) => new Promise((r) => setTimeout(r, ms));

export async function login(page) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle2' });
    await page.type('#email', 'agustin@fototobares.com');
    await page.click('#password');
    // page.type can't produce the ñ of "contraseña"
    await page.keyboard.type('contrase');
    await page.keyboard.sendCharacter('ñ');
    await page.keyboard.type('a');
    await page.click('form button');
    await page.waitForFunction(() => location.pathname === '/dashboard', {
        timeout: 15000,
    });
}

export async function findByText(page, selector, text, { exact = false } = {}) {
    const handle = await page.evaluateHandle(
        (sel, txt, ex) => {
            const els = [...document.querySelectorAll(sel)];
            return (
                els.find((e) =>
                    ex
                        ? e.textContent.trim() === txt
                        : e.textContent.trim().includes(txt),
                ) || null
            );
        },
        selector,
        text,
        exact,
    );
    return handle.asElement();
}

export async function clickByText(page, selector, text, opts) {
    const el = await findByText(page, selector, text, opts);
    if (!el) throw new Error(`clickByText: not found ${selector} "${text}"`);
    await el.click();
}

// Accordion/dialog transitions animate; a click computed mid-animation can
// land on the wrong element. Click and re-check an expected selector, retrying.
export async function clickUntil(page, selector, text, expectedSelector, tries = 3) {
    for (let i = 0; i < tries; i++) {
        await settle();
        try {
            await clickByText(page, selector, text);
        } catch {
            continue;
        }
        try {
            await page.waitForSelector(expectedSelector, { timeout: 3000 });
            return;
        } catch {
            /* retry */
        }
    }
    throw new Error(`clickUntil: ${expectedSelector} never appeared after "${text}"`);
}

export async function waitForText(page, text, timeout = 15000) {
    await page.waitForFunction(
        (txt) => document.body.innerText.includes(txt),
        { timeout },
        text,
    );
}

export async function bodyHas(page, text) {
    return page.evaluate((txt) => document.body.innerText.includes(txt), text);
}

export async function inputValue(page, selector) {
    return page.$eval(selector, (el) => el.value);
}

/** Text of the Radix accordion step triggers (badges live there). Assert on
 * this instead of body.innerText: Radix Select keeps a visually-hidden native
 * <select> whose <option> texts pollute innerText. */
export async function triggersText(page) {
    return page.evaluate(() =>
        [...document.querySelectorAll('button[data-state]')]
            .map((b) => b.textContent)
            .join(' | '),
    );
}

/** Browser lifecycle + PASS/FAIL accounting + error screenshot. */
export async function run(name, fn) {
    const browser = await puppeteer.launch({
        executablePath: BRAVE,
        headless: 'new',
        args: ['--no-first-run', '--disable-features=Translate'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const results = [];
    const check = (label, cond, extra = '') => {
        results.push({ label, pass: !!cond });
        console.log(`${cond ? 'PASS' : 'FAIL'} — ${label}${extra ? ` | ${extra}` : ''}`);
    };

    try {
        await fn(page, check);
        const failed = results.filter((r) => !r.pass);
        console.log(`\n${results.length - failed.length}/${results.length} checks OK`);
        process.exitCode = failed.length ? 1 : 0;
    } catch (err) {
        console.error('SCRIPT ERROR:', err.message);
        const shot = `${process.cwd()}/${name}-error.png`;
        await page.screenshot({ path: shot });
        console.error(`screenshot: ${shot}`);
        process.exitCode = 2;
    } finally {
        await browser.close();
    }
}
