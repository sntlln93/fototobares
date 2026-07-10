---
name: verify
description: Verificación end-to-end en browser de cambios de UI (build + puppeteer-core + Brave contra Sail).
---

# Verificar cambios de UI en browser

## Build y servir

No hay Vite dev server: la app (Sail, `http://localhost`) sirve los assets buildeados.
Tras cada cambio de frontend correr `./vendor/bin/sail npm run build` antes de mirar el browser.

## Harness listo para usar: `scripts/`

**No escribir el boilerplate de cero**: `scripts/helpers.mjs` ya trae login, `clickByText`/
`clickUntil` (clicks con retry), `waitForText`, `triggersText` y `run()` (lifecycle + PASS/FAIL +
screenshot en error). `puppeteer-core` ya está instalado ahí (`npm install` si falta;
el node local v20 sirve para esto). Ejemplo completo: `scripts/verify-101.mjs` (flujo de
crear pedido + guardar y seguir vendiendo). Correr con `node scripts/verify-<x>.mjs` y
guardar los scripts nuevos en esa carpeta para reusarlos.

Brave del host: `/Applications/Brave Browser.app/Contents/MacOS/Brave Browser`, `headless: 'new'`.

## Login (gotchas reales)

- La página de login es `/` (la raíz), **no** `/login` (404). Inputs `#email` / `#password`.
- Credenciales: `agustin@fototobares.com` / `contraseña` (usuario master de las migraciones).
- La ñ de "contraseña" no sale con `page.type`: usar `page.keyboard.type('contrase')` +
  `page.keyboard.sendCharacter('ñ')` + `page.keyboard.type('a')`.
- El submit es `form button` (el Button de shadcn no lleva `type="submit"` explícito).
- Inertia navega por pushState: **no** usar `waitForNavigation`; usar
  `page.waitForFunction(() => location.pathname === '/dashboard')`.

## Gotchas de componentes (Radix/shadcn/cmdk)

- **No asertar sobre `document.body.innerText`**: el Select de Radix mantiene un `<select>`
  nativo visually-hidden con un `<option>` por item ("Escuela Normal…") que contamina
  innerText → falsos positivos. Asertar sobre los triggers (`triggersText()` en helpers).
- **Animaciones de accordion/dialog**: un click calculado a mitad de animación cae en otro
  elemento (p.ej. colapsa el paso en vez de abrir el popover). Usar `clickUntil(page, sel,
  texto, selectorEsperado)` que reintenta.
- **Combobox (cmdk)**: el input de búsqueda filtra por el `value` del item (acá el **id**
  numérico), no por el label → no tipear para buscar; clickear el `[cmdk-item]` por texto.
- **`<Link as="button">` de Inertia** renderiza `<button>`, no `<a>` (el "Ver" de /drafts).
  Y matchear texto exacto: `includes('Ver')` también matchea "Vender".
- **Inputs `type="number"`**: triple-click + type deja "02" en el value → comparar con
  `Number(value)`.
- Si el flujo crea datos (pedidos, clientes), **limpiarlos por tinker al final** (ver
  encabezado de `scripts/verify-101.mjs`).

## Qué medir en fixes de layout mobile

- Regla del repo: nunca scroll horizontal de página. Chequear
  `document.documentElement.scrollWidth === window.innerWidth` en 320 / 351 / 390 px.
- Para datos extremos, crear registros temporales por tinker
  (`sail artisan tinker --execute="..."`) y borrarlos al final.
- Gotcha de CSS aprendido acá: un `whitespace-nowrap` profundo propaga su min-content
  hasta la grilla si el track es implícito; `grid-cols-1` (=`minmax(0,1fr)`) lo corta,
  `min-w-0` en el item intermedio no alcanza.
