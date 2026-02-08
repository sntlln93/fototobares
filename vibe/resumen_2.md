# Resumen de Cambios - Fase 2

**Fecha**: 8 de febrero de 2026  
**Total de cambios**: 6 requisitos completados

---

## 1. Guardar y seguir vendiendo (persistencia en localStorage) ✅

### Cambios realizados:

**Frontend:**
- Archivo: `resources/js/pages/orders/create.tsx`
  - Se agregó carga inicial desde `localStorage`.
  - Se guardan datos no personales para continuar vendiendo sin reingresar datos del cliente.
  - Botón "Guardar y seguir vendiendo" limpia nombre/teléfono/niño y preserva productos y cuotas.

**Resultado**: Flujo rápido para ventas consecutivas sin repetir datos.

---

## 2. Guardar pedidos como borrador ✅

### Cambios realizados:

**Base de datos:**
- Migración: `2025_02_08_000001_create_order_drafts_table.php`
  - Nueva tabla `order_drafts` con productos en JSON, datos del cliente y estado de sesión.

**Backend:**
- Modelo: `app/Models/OrderDraft.php`
- Controlador: `app/Http/Controllers/BO/OrderDraftController.php`
- Resource: `app/Http/Resources/OrderDraftResource.php`
- Ruta: `Route::resource('drafts', ...)`

**Frontend:**
- Vista: `resources/js/pages/drafts/index.tsx`
- Botón "Guardar como borrador" integrado en la venta.

**Resultado**: Se pueden almacenar pedidos incompletos para retomarlos luego.

---

## 3. Restricción de edición por pagos ✅

### Cambios realizados:

**Backend:**
- Archivo: `app/Http/Controllers/BO/OrderController.php`
  - Verificación de pagos: si la primera cuota está cubierta, la orden no se puede editar.
  - Se devuelve error de validación si la orden está bloqueada.

**Resultado**: Se protege la integridad de órdenes con pagos avanzados.

---

## 4. Edición de pedidos ✅

### Cambios realizados:

**Backend:**
- Archivo: `app/Http/Controllers/BO/OrderController.php`
  - Métodos `edit()` y `update()` con transacción.

**Frontend:**
- Vista nueva: `resources/js/pages/orders/edit.tsx`
- Botón de edición agregado en `resources/js/pages/orders/show.tsx`

**Resultado**: Se pueden editar pedidos antes de cubrir la primera cuota.

---

## 5. Campo “borrador” en cursos ✅

### Cambios realizados:

**Base de datos:**
- Migración: `2025_02_08_000002_add_draft_field_to_classrooms.php`
  - Agregado campo `is_draft` en `classrooms` con default `false`.

**Backend:**
- Modelo: `app/Models/Classroom.php` (cast boolean)
- Controlador: `app/Http/Controllers/BO/ClassroomController.php` (validación y persistencia)

**Frontend:**
- Formularios: `resources/js/pages/classrooms/create.tsx` y `resources/js/pages/classrooms/edit.tsx`
  - Checkbox "Marcar como borrador".

**Resultado**: Se puede marcar un curso como borrador desde el formulario.

---

## 6. Subida de fotos por curso con numeración ✅

### Cambios realizados:

**Base de datos:**
- Migración: `2025_02_08_000003_create_photos_table.php`
  - Tabla `photos` con `classroom_id`, `file_path`, `number` y `unique(classroom_id, number)`.

**Backend:**
- Modelo: `app/Models/Photo.php`
- Controlador: `app/Http/Controllers/BO/PhotoController.php`
  - `store()` guarda imagen y asigna número secuencial por curso.
  - `destroy()` elimina archivo y re-numera.
- Rutas: `routes/web.php` con URLs por curso.

**Frontend:**
- Vista: `resources/js/pages/photos/index.tsx`
  - Subida con vista previa y grilla numerada.
- Acceso desde curso: botón en `resources/js/pages/classrooms/show.tsx`.

**Resultado**: Se puede subir, listar y eliminar fotos con numeración automática por curso.

---

## Archivos creados

1. `/var/www/html/database/migrations/2025_02_08_000001_create_order_drafts_table.php`
2. `/var/www/html/app/Models/OrderDraft.php`
3. `/var/www/html/app/Http/Controllers/BO/OrderDraftController.php`
4. `/var/www/html/app/Http/Resources/OrderDraftResource.php`
5. `/var/www/html/resources/js/pages/drafts/index.tsx`
6. `/var/www/html/resources/js/pages/orders/edit.tsx`
7. `/var/www/html/database/migrations/2025_02_08_000002_add_draft_field_to_classrooms.php`
8. `/var/www/html/database/migrations/2025_02_08_000003_create_photos_table.php`
9. `/var/www/html/app/Http/Controllers/BO/PhotoController.php`
10. `/var/www/html/resources/js/pages/photos/index.tsx`

## Archivos modificados (principales)

**Backend (PHP):**
- `app/Http/Controllers/BO/OrderController.php`
- `app/Http/Controllers/BO/ClassroomController.php`
- `app/Models/Classroom.php`
- `app/Models/Photo.php`
- `routes/web.php`

**Frontend (React/TypeScript):**
- `resources/js/pages/orders/create.tsx`
- `resources/js/pages/orders/show.tsx`
- `resources/js/pages/classrooms/show.tsx`
- `resources/js/pages/classrooms/create.tsx`
- `resources/js/pages/classrooms/edit.tsx`
- `resources/js/types/global.d.ts`

---

## Próximos pasos

1. Ejecutar migraciones:
   ```bash
   php artisan migrate
   ```

2. Probar flujos principales:
   - Guardar y seguir vendiendo
   - Guardar borrador de pedido
   - Editar pedido con y sin pagos
   - Marcar curso como borrador
   - Subir/eliminar fotos por curso

---

**Status**: Completado ✅  
**Total de cambios**: 3 migraciones + 10+ archivos modificados + 10 archivos nuevos (aprox.)
