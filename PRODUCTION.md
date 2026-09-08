# RidePerks: publicación de la plataforma

La plataforma vive en este repositorio junto al landing y la lista de espera. La guía funcional es `nicoferrari05/rideperks-platform`; no se modificó ese repositorio. El lanzamiento es gratuito, sin Yappy ni cargos automáticos.

## Configuración antes del push a main

1. En el mismo proyecto de Supabase de la lista de espera, ejecutar en orden:
   - `supabase/migrations/202609080001_driver_platform.sql`
   - `supabase/migrations/202609080002_waitlist_privacy.sql`
2. En el proyecto existente de Vercel, conservar `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`. El secreto de sesión debe tener al menos 32 caracteres.
3. Agregar `SUPABASE_ANON_KEY`, la clave pública anon del mismo proyecto.
4. Configurar `SITE_URL=https://rideperks.app` (también es el valor predeterminado).
5. En Supabase Authentication → URL Configuration:
   - Site URL: `https://rideperks.app`
   - Redirect URLs: `https://rideperks.app/auth/callback` y `https://rideperks.app/auth/callback?next=/account/password`.
   - Para pruebas locales, agregar los equivalentes en `http://localhost:3100`.
6. Mantener habilitado el proveedor Email y la confirmación del correo. Configurar SMTP de producción en Supabase para poder enviar confirmaciones y recuperación a los conductores; probar la entrega a una cuenta del equipo.
7. Publicar mediante GitHub. Vercel despliega el repositorio conectado al actualizar `main`.

Las claves reales se guardan solo en variables de entorno. No copiar `.env.local` a Git. `SUPPORT_EMAIL` es opcional; el formulario de Ayuda guarda las solicitudes en el panel aunque no se configure un correo.

## Operación

- Conductores: `/register` → confirmación por correo → `/login` → `/driver/dashboard`.
- Una cuenta puede explorar beneficios mientras espera verificación. Para canjear necesita estado verificado.
- Administración: `/admin` mantiene la lista de espera. `/admin/platform` gestiona verificaciones, conductores, comercios, beneficios y ayuda.
- Crear comercios reales antes de crear sus beneficios. Los montos deben corresponder a lo acordado con el comercio.
- El responsable del comercio se registra primero. Desde Conductores se copia su ID y se vincula al comercio. Esa cuenta pasa a usar `/business`.
- El comercio escanea o pega el código y confirma el beneficio. No usa contraseñas compartidas ni códigos de comercio en URLs.
- El ahorro mostrado corresponde al monto fijo guardado en cada canje. Los descuentos variables se muestran como usos confirmados sin estimar un ahorro.
- Atender las solicitudes de soporte y privacidad desde Ayuda en administración. Marcar una solicitud como atendida no elimina una cuenta automáticamente.
- Los registros se pausan; no hay botones que borren comercios o beneficios con historial.

## Seguridad

Las tablas nuevas llevan prefijo `rp_`. RLS está habilitado y los roles anon/authenticated no tienen acceso directo. Las operaciones pasan por Next.js, que comprueba la sesión y limita los datos al usuario autenticado; la clave service_role nunca se importa en componentes de cliente.

El registro no permite elegir rol ni estado de verificación. Los documentos se guardan en un bucket privado; administración recibe enlaces firmados de cinco minutos. Los códigos vencen en dos minutos, se usan una vez y los canjes se registran dentro de una transacción PostgreSQL con bloqueos, validación del comercio, estado del conductor, vigencia y límite mensual.

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

Crea cuentas confirmadas sin enviar correos, un comercio y un beneficio temporales, verifica el flujo conductor/admin/comercio y elimina los registros identificados por los IDs de esa ejecución. Las capturas van a `artifacts/`, excluido de Git. No apunta al sitio público por defecto; usa la app local y el Supabase configurado.

Después del despliegue:

```text
node scripts/check-production.mjs https://rideperks.app
```

Comprobar además en un teléfono: registro y entrega del email de confirmación, recuperación, instalación PWA y escaneo con cámara entre dos dispositivos. Las pruebas de navegador automatizadas no sustituyen la verificación física de la cámara o la entrega de correo.

## Recuperación ante un despliegue fallido

Revertir el commit de aplicación en GitHub y dejar que Vercel reconstruya. Conservar las tablas nuevas y sus datos; las migraciones son aditivas y la lista de espera sigue usando sus tablas existentes. No borrar las tablas para revertir el frontend. La protección adicional de la vista puede mantenerse.

## Alcance de esta versión

Incluye landing con entrada al login, registro, confirmación y recuperación, inicio del conductor, catálogo y condiciones, códigos de uso, directorio, historial, perfil, verificación, soporte, administración y portal de canje del comercio. No incluye cobros: el acceso gratuito fue la decisión del lanzamiento. No se publican comercios ni descuentos ficticios.
