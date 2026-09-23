# RidePerks: publicación de la plataforma

La plataforma vive en este repositorio junto al landing y la lista de espera. La guía funcional es `nicoferrari05/rideperks-platform`; no se modificó ese repositorio. La membresía definida el 10 de septiembre de 2026 cuesta $15.00 al mes, con renovación manual mediante Yappy. Consulta YAPPY.md para configurar y activar pagos. No hay cargos automáticos.

El dominio `rideperks.app` / `www.rideperks.app` está asignado al proyecto de Vercel **`ride-perks`** del equipo `nicoferraric-icloudcoms-projects`. Los proyectos `rideperks` y `rideperks-landing` son proyectos distintos: cambiar sus variables no modifica este dominio.

## Configuración antes del push a main

Para pagos aplicar también `supabase/migrations/202609100001_yappy_memberships.sql` y seguir `YAPPY.md`. La migración conserva el acceso gratuito hasta completar la configuración.

1. En el mismo proyecto de Supabase de la lista de espera, ejecutar en orden:
   - `supabase/migrations/202609080001_driver_platform.sql`
   - `supabase/migrations/202609080002_waitlist_privacy.sql`
   - `supabase/migrations/202609090001_qr_short_codes.sql` (agrega el código corto de 6 caracteres para cuando falla la cámara; sin esta migración, generar códigos falla hasta aplicarla)
     Para copiar las tres en un solo paso, ejecutar `node scripts/prepare-supabase.mjs` y abrir `artifacts/ACTIVAR_RIDEPERKS.sql`. Pegar todo en SQL Editor y ejecutar Run. El archivo se genera directamente de las migraciones anteriores y no contiene claves. La consulta final debe mostrar `rp_profiles`, `rp_settings` y `false` para el acceso público a la vista de la lista de espera.
2. En el proyecto existente de Vercel, conservar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`. El secreto de sesión debe tener al menos 32 caracteres.
3. Agregar `SUPABASE_ANON_KEY`, la clave pública anon del mismo proyecto.
4. Configurar `SITE_URL=https://rideperks.app` (también es el valor predeterminado).
5. En Supabase Authentication → URL Configuration:
   - Site URL: `https://rideperks.app`
   - Redirect URLs: `https://rideperks.app/auth/callback` y `https://rideperks.app/auth/callback?next=/account/password`.
   - Para pruebas locales, agregar los equivalentes en `http://localhost:3100`.
6. Mantener habilitado el proveedor Email. Por decisión del lanzamiento, el registro web crea cuentas confirmadas desde el servidor y no envía correo. La recuperación de contraseñas por correo aún requiere configurar SMTP; no se ha validado su entrega.
7. Publicar mediante GitHub. Vercel despliega el repositorio conectado al actualizar `main`. Si solo cambias variables, volver a desplegar el despliegue **Production / Current** de `main` en `ride-perks`; un Redeploy de Preview no actualiza el dominio.

Las claves reales se guardan solo en variables de entorno. No copiar `.env.local` a Git. `SUPPORT_EMAIL` es opcional; el formulario de Ayuda guarda las solicitudes en el panel aunque no se configure un correo.

## Operación

- Conductores: `/register` → acceso inmediato a `/driver/dashboard`, sin correo de confirmación.
- Una cuenta puede explorar beneficios mientras espera verificación. Para canjear necesita estado verificado.
- Administración: `/admin` mantiene la lista de espera. `/admin/platform` gestiona verificaciones, conductores, comercios, beneficios y ayuda.
- Crear comercios reales antes de crear sus beneficios. Los montos deben corresponder a lo acordado con el comercio.
- El responsable se registra en `/business/register` e inicia sesión en `/business/login`. En Administración → Comercios se crea el negocio y se selecciona la cuenta responsable por su nombre. El ID se genera automáticamente. También se permite guardar sin responsable y vincularlo después. Hasta la vinculación no puede canjear.
- El comercio escanea el QR o escribe el código corto de 6 caracteres (alternativa si falla la cámara) y confirma el beneficio. No usa contraseñas compartidas ni códigos de comercio en URLs.
- El ahorro mostrado corresponde al monto fijo guardado en cada canje. Los descuentos variables se muestran como usos confirmados sin estimar un ahorro.
- Atender las solicitudes de soporte y privacidad desde Ayuda en administración. Marcar una solicitud como atendida no elimina una cuenta automáticamente.
- Los registros se pausan; no hay botones que borren comercios o beneficios con historial.

## Seguridad

Las tablas nuevas llevan prefijo `rp_`. RLS está habilitado y los roles anon/authenticated no tienen acceso directo. Las operaciones pasan por Next.js, que comprueba la sesión y limita los datos al usuario autenticado; la clave service_role nunca se importa en componentes de cliente.

Cada formulario de registro asigna un rol fijo (conductor o comercio); ningún campo enviado permite elegir privilegios ni estado de verificación. El registro rechaza correos existentes y nunca cambia su contraseña ni los confirma. Subir una captura deja la solicitud pendiente: en Administración → Verificaciones un administrador revisa la imagen privada y aprueba o rechaza. Los documentos se guardan en un bucket privado; administración recibe enlaces firmados de cinco minutos. Los códigos vencen en dos minutos, se usan una vez y los canjes se registran dentro de una transacción PostgreSQL con bloqueos, validación del comercio, estado del conductor, vigencia y límite mensual.

La segunda migración corrige el acceso directo anónimo de la vista heredada `waitlist_ranked`. No cambia filas; el servidor conserva acceso para operar la lista y el contador.

Las sesiones de administración vencen a las 12 horas, con expiración verificada en el servidor. Desplegar esta versión invalida las cookies antiguas y requiere volver a iniciar sesión.

## Verificación

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm start -- --port 3100
npm run test:e2e
```

Las pruebas de base de datos usan PostgreSQL local con PGlite. Cubren permisos, inyección de rol, verificaciones, límites, vigencia, canje único y privacidad de la lista de espera.

Prueba integrada contra Supabase, solo cuando ambas migraciones están aplicadas y `.env.local` está configurado:

```text
npm run test:e2e:live
```

Crea cuentas confirmadas sin enviar correos, un comercio y un beneficio temporales, verifica el flujo conductor/admin/comercio y elimina los registros identificados por los IDs de esa ejecución. Las capturas van a `artifacts/`, excluido de Git. No apunta al sitio público por defecto; usa la app local y el Supabase configurado. Comprueba primero `/api/health` y no crea datos de prueba si el destino no está disponible. Para probar los portales publicados, usar `TEST_BASE_URL=https://www.rideperks.app`; `TEST_ADMIN_BASE_URL=http://localhost:3100` permite aprobar la verificación desde la app local conectada a la misma base, sin descargar contraseñas de producción.

Después del despliegue:

```text
node scripts/check-production.mjs https://rideperks.app
```

Comprobar además en un teléfono: registro sin correo, instalación PWA y escaneo con cámara entre dos dispositivos. Las pruebas de navegador automatizadas no sustituyen la verificación física de la cámara o la entrega de correo.

## Recuperación ante un despliegue fallido

Revertir el commit de aplicación en GitHub y dejar que Vercel reconstruya. Conservar las tablas nuevas y sus datos; las migraciones son aditivas y la lista de espera sigue usando sus tablas existentes. No borrar las tablas para revertir el frontend. La protección adicional de la vista puede mantenerse.

## Alcance de esta versión

Incluye landing con entrada al login, registro sin confirmación por correo, recuperación pendiente de SMTP, inicio del conductor, catálogo y condiciones, códigos de uso, directorio, historial, perfil, verificación, soporte, administración y portal de canje del comercio. Incluye membresías Yappy; free_access se desactivó (pasó a `false`) el 10/11 de septiembre de 2026 — el plan pago ya está activo y es requisito real para el acceso. No se publican comercios ni descuentos ficticios.

## Cambios de septiembre 2026 (endurecimiento y operación)

Aplicar antes del código: `supabase/migrations/202609120001_hardening_and_ops.sql` (o regenerar `artifacts/ACTIVAR_RIDEPERKS.sql` con `node scripts/prepare-supabase.mjs`).

- **Catálogo del conductor**: `rp_settings.catalog_live` (por defecto `false`). Se activa desde el interruptor en `/admin/platform`. Oculto, Beneficios y Comercios muestran «Próximamente» y el detalle de beneficio devuelve 404. Los tests live de conductor requieren `catalog_live = true`.
- **Pausa de beneficios**: pausar un beneficio desde el admin lo marca `admin_paused`; el comercio no puede reactivarlo.
- **Cambios de comercio**: nombre, dirección y categoría pasan por revisión en `/admin/reviews`; descripción y teléfono se guardan directo.
- **Responsable de comercio**: solo cuentas con rol comercio (`rp_save_business` ya no promueve conductores).
- **Cierre de cuenta**: además del perfil, borra capturas de verificación, mensajes de soporte y la inscripción en la lista de espera. Las capturas también se borran al aprobar o rechazar una verificación.
- **Pagos**: cron diario `/api/cron/daily` (`vercel.json`) vence órdenes pendientes de más de 24 h y envía recordatorio 2–3 días antes del vencimiento. En `/admin/payments` se puede acreditar una orden manualmente (requiere identidad administrativa; queda en auditoría).
- **Límites del comercio**: consultar 240 y confirmar 120 por 10 minutos, por persona.
- **Cabeceras**: HSTS activo. La política CSP se envía como `Content-Security-Policy-Report-Only`; tras verificar `/driver/membership` con Yappy sin avisos en la consola, cambiar la clave en `next.config.mjs` a `Content-Security-Policy`.

### Variables nuevas (todas opcionales salvo `CRON_SECRET`)

| Variable | Para qué |
| --- | --- |
| `CRON_SECRET` | Autoriza el cron diario (Vercel lo envía como Bearer). |
| `RESEND_API_KEY`, `EMAIL_FROM` | Recibos, aviso de verificación y recordatorios. Sin ellas los correos se omiten. |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Captcha de Cloudflare en el registro. Sin ambas no se muestra. |

### Recuperación de contraseña (pendiente de configuración externa)

En Supabase → Authentication → SMTP Settings, activar SMTP propio (por ejemplo Resend: host `smtp.resend.com`, puerto 465, usuario `resend`, contraseña = API key) con un remitente de un dominio verificado. El SMTP por defecto de Supabase solo permite unos pocos correos por hora. Después probar `/recover` con una cuenta real.
