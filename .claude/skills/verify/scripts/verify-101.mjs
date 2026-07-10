/* E2E verification for issue #101 — autofill only via "guardar y seguir
 * vendiendo". Creates a real order (Escuela Normal / 6TO A / Taza) — clean up
 * afterwards with:
 *
 *   sail artisan tinker --execute="
 *     foreach (\App\Models\Client::with('orders')->where('phone','3804999999')->get() as \$c) {
 *       foreach (\$c->orders as \$o) { \$o->details()->delete(); \$o->forceDelete(); }
 *       \$c->delete();
 *     }"
 */
import {
    BASE,
    bodyHas,
    clickByText,
    clickUntil,
    inputValue,
    login,
    run,
    settle,
    triggersText,
    waitForText,
} from './helpers.mjs';

run('verify-101', async (page, check) => {
    await login(page);
    console.log('logged in');

    // ============ Scenario A: full order + "guardar y seguir vendiendo" ========
    await page.goto(`${BASE}/orders/create`, { waitUntil: 'networkidle2' });

    // Step 1: school + classroom (radix selects)
    await page.waitForSelector('button[role="combobox"]');
    let triggers = await page.$$('button[role="combobox"]');
    await triggers[0].click();
    await page.waitForSelector('[role="option"]');
    await clickByText(page, '[role="option"]', 'Escuela Normal');
    await settle(300);
    triggers = await page.$$('button[role="combobox"]');
    await triggers[1].click();
    await page.waitForSelector('[role="option"]');
    await clickByText(page, '[role="option"]', '6TO A');
    await clickUntil(page, 'button', 'Siguiente', '#name');

    // Step 2: client
    await page.type('#name', 'Cliente E2E');
    await page.type('#phone', '3804999999');
    await page.type('#child_name', 'Bruno');
    await page.click('input[name="attended_photo_session"][value="true"]');
    await settle();
    await clickByText(page, 'button', 'Siguiente');

    // Step 3: add product "Taza" (type 2 → only a note). The cmdk search input
    // filters by item VALUE (the id) — click the item by text, don't search.
    await page.waitForFunction(() =>
        [...document.querySelectorAll('button')].some((b) =>
            b.textContent.includes('Añadir producto'),
        ),
    );
    await clickUntil(page, 'button', 'Añadir producto', '[cmdk-item]');
    await clickByText(page, '[cmdk-item]', 'Taza');
    await page.waitForSelector('#note');
    await page.type('#note', 'Taza de Bruno');
    await clickByText(page, 'button', 'Agregar 1 producto');
    await page.waitForFunction(() => !document.querySelector('#note'));
    check(
        'A0: producto agregado (badge "1 productos")',
        /1 productos/.test(await triggersText(page)),
    );
    await clickUntil(page, 'button', 'Siguiente', '#total_price');

    // Step 4: price + installments, then save-and-continue
    await page.click('#total_price', { clickCount: 3 });
    await page.type('#total_price', '12000');
    await page.click('#payment_plan', { clickCount: 3 });
    await page.type('#payment_plan', '2');
    await clickByText(page, 'button', 'Guardar y seguir vendiendo');
    await waitForText(page, 'Se conservaron la escuela');
    console.log('order saved with continue-selling');
    await settle();

    // -- Assertions after the in-memory reset --
    const clientOpen = await page.evaluate(() => {
        const trigger = [...document.querySelectorAll('button')].find(
            (b) =>
                b.textContent.includes('Cliente') && b.getAttribute('data-state'),
        );
        return trigger?.getAttribute('data-state') === 'open';
    });
    check('A1: acordeón abierto en paso Cliente', clientOpen);
    await page.waitForSelector('#name');
    check('A2: cliente vacío', (await inputValue(page, '#name')) === '');
    check('A3: teléfono vacío', (await inputValue(page, '#phone')) === '');
    check(
        'A4: nombre del niño vacío',
        (await inputValue(page, '#child_name')) === '',
    );
    let trig = await triggersText(page);
    check(
        'A5: escuela/curso conservados en el badge',
        trig.includes('Escuela Normal') && trig.includes('6TO A'),
    );
    check('A6: productos vacíos (0 productos)', trig.includes('0 productos'));
    await clickUntil(page, 'button', 'Pedido', '#total_price');
    check(
        'A7: precio reseteado a 0',
        (await inputValue(page, '#total_price')) === '0',
    );
    {
        // number inputs keep "02" after a triple-click replace — compare Number()
        const plan = await inputValue(page, '#payment_plan');
        check('A8: cuotas conservadas (2)', Number(plan) === 2, `valor="${plan}"`);
    }
    check(
        'A9: no queda nada en localStorage',
        await page.evaluate(() => localStorage.getItem('orderFormData') === null),
    );

    // ============ Scenario C: reload right after save-and-continue ==============
    await page.reload({ waitUntil: 'networkidle2' });
    await settle();
    trig = await triggersText(page);
    check(
        'C1: tras refrescar, formulario vacío (sin escuela conservada)',
        !trig.includes('Escuela Normal'),
        trig,
    );
    check('C2: sin toast de datos cargados', !(await bodyHas(page, 'cargado')));

    // ============ Scenario B: navigate away and back (Inertia link) =============
    await page.goto(`${BASE}/orders`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('a[href*="/orders/create"]');
    await page.click('a[href*="/orders/create"]');
    await page.waitForFunction(() => location.pathname === '/orders/create');
    await settle(800);
    trig = await triggersText(page);
    check(
        'B1: entrada normal → formulario vacío',
        !trig.includes('Escuela Normal') && trig.includes('0 productos'),
        trig,
    );
    check('B2: sin toast de datos cargados', !(await bodyHas(page, 'cargado')));
    await clickUntil(page, 'button', 'Pedido', '#total_price');
    check(
        'B3: precio y cuotas en 0',
        (await inputValue(page, '#total_price')) === '0' &&
            (await inputValue(page, '#payment_plan')) === '0',
    );

    // ============ Scenario D: draft flow still autofills ========================
    await page.goto(`${BASE}/drafts`, { waitUntil: 'networkidle2' });
    // "Ver" is a <Link as="button"> — and match must be exact ("Vender" exists)
    await page.waitForFunction(() =>
        [...document.querySelectorAll('button')].some(
            (b) => b.textContent.trim() === 'Ver',
        ),
    );
    await clickByText(page, 'button', 'Ver', { exact: true });
    await page.waitForFunction(() => location.pathname === '/orders/create');
    await waitForText(page, 'cargado');
    check('D1: toast "Borrador #N cargado"', await bodyHas(page, 'Borrador #'));
    await settle();
    trig = await triggersText(page);
    check(
        'D2: borrador autorellena productos',
        /[1-9]\d* productos/.test(trig),
        trig,
    );
});
