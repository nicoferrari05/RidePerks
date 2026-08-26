# RidePerks — Landing page + lista de espera

Landing page para RidePerks (club de beneficios para conductores de Uber,
InDrive y PedidosYa en Panamá) con formulario de lista de espera + cola de
referidos, y un panel de administración en `/admin` para ver los conductores
inscritos.

Diseño y contenido alineados con la versión ya publicada en
[rideperks.app](https://rideperks.app): misma fuente (Geist), misma paleta
de colores, mismos beneficios (Combustible 20% · Comida $5 · Taller 15% ·
Salud 10%) y la misma mecánica de "invita y sube en la fila".

> ¿Vas a pasarle este proyecto a alguien más para que conecte Supabase y
> el dominio? Empieza por **[HANDOFF.md](HANDOFF.md)**.

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS v4
- **Animaciones:** GSAP + ScrollTrigger (reveals al hacer scroll, sutiles)
- **Fondo del hero:** componente `GradientWaves` (WebGL vía `ogl`), en tonos
  de marca, casi estático (velocidad muy baja, sin parallax de mouse)
- **Base de datos:** Supabase (Postgres), solo accedida desde el servidor
- **Admin:** protegido con una sola contraseña compartida (cookie firmada)

---

## 1. Requisitos

- Node.js 20 o superior
- Una cuenta gratuita de [Supabase](https://supabase.com)
- (Para producción) una cuenta de [Vercel](https://vercel.com) — es la
  forma más simple de desplegar Next.js con un dominio propio

## 2. Configurar Supabase

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor** → **New query**, pega el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**. Esto crea:
   - la tabla `waitlist` (nombre, email, WhatsApp opcional, plataforma
     opcional, código de referido, estado, fecha)
   - la vista `waitlist_ranked`, que calcula la posición en la fila de
     cada quien (más referidos = más arriba; empates se resuelven por
     quién se anotó primero)
   - la tabla `app_settings` (guarda si el contador público está encendido)
   - seguridad a nivel de fila (RLS) activada sin políticas públicas, así
     que **nadie puede leer ni escribir desde el navegador** — solo el
     servidor de Next.js, usando la clave secreta de abajo.

   Si ya habías corrido una versión anterior de este archivo (sin
   email/referidos), usa en su lugar
   [`supabase/migration-referrals.sql`](supabase/migration-referrals.sql)
   para actualizar la tabla sin perder los registros existentes.
3. Ve a **Project Settings → API** y copia:
   - **Project URL** → será `SUPABASE_URL`
   - **service_role key** (la secreta, no la "anon public") →
     será `SUPABASE_SERVICE_ROLE_KEY`

## 3. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa los valores:

```bash
cp .env.local.example .env.local
```

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_PASSWORD=elige-una-clave-para-el-admin
ADMIN_SESSION_SECRET=una-cadena-aleatoria-larga
```

`ADMIN_SESSION_SECRET` puede ser cualquier cadena larga y aleatoria (se usa
para firmar la sesión del admin, no hay que recordarla). Para generarla:

```bash
openssl rand -hex 32
```

## 4. Correr en desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para la landing page, y
[http://localhost:3000/admin](http://localhost:3000/admin) para el panel de
administración (te pedirá la contraseña de `ADMIN_PASSWORD`).

## 5. Desplegar en Vercel con tu propio dominio

1. Sube este proyecto a un repositorio de GitHub.
2. En [vercel.com](https://vercel.com), **New Project** → importa el repo.
3. En **Environment Variables**, agrega las mismas 4 variables de
   `.env.local` (los valores reales, no el archivo).
4. Deploy.
5. En **Project Settings → Domains**, agrega tu dominio (por ejemplo
   `rideperks.app`) y sigue las instrucciones de DNS que te da Vercel
   (normalmente un registro `A` o `CNAME` en tu proveedor de dominio).

Cada vez que hagas push a la rama principal, Vercel vuelve a desplegar
automáticamente.

## 6. La cola de referidos ("sube en la fila")

Cada persona que se anota recibe un código propio (ej. `X7K2QP`) y un link
para compartir: `tudominio.com/?ref=X7K2QP`. Quien entra por ese link queda
marcado como referido por esa persona.

La posición en la fila se calcula así (vista `waitlist_ranked` en Supabase):
más referidos exitosos = más arriba; en caso de empate, quien se anotó
primero va antes. No hay límites ni pesos raros — es simplemente "ordenar
por número de referidos, luego por fecha".

Después de anotarse, cada quien ve su posición y su link para compartir
(con botón de copiar y de enviar por WhatsApp). Si vuelve a entrar al
sitio desde el mismo navegador, lo reconoce (se guarda su código en
`localStorage`) y le muestra directamente su posición actualizada, sin
tener que anotarse de nuevo.

## 7. Cómo funciona la "verificación" de conductores (versión actual)

Por ahora no se pide ningún documento al inscribirse — solo nombre, email,
y opcionalmente WhatsApp y plataforma. Cada registro entra con estado
**"Pendiente"** en `/admin`. Desde ahí, quien administre puede:

- Escribirle o llamar al conductor para confirmar que es real, y marcarlo
  como **"Verificado"**.
- Marcarlo como **"Rechazado"** si no corresponde.

Esto se puede reforzar más adelante (foto de cédula/perfil de conductor,
verificación del número por WhatsApp OTP, etc.) sin cambiar el resto del
sitio — el campo `status` ya existe en la base de datos para eso.

## 8. El contador público

`/admin` tiene un interruptor **"Contador público"**. Cuando está
encendido, la landing page muestra "N conductores ya en la lista" (el
número real de inscritos). Cuando está apagado, ese elemento simplemente no
aparece en la página. Se puede prender/apagar en cualquier momento sin
volver a desplegar nada.

## 9. Marca: fuente y colores

Coinciden con lo que ya está en producción en rideperks.app:

- **Fuente principal:** Geist (vía `next/font/google`)
- **Acento:** Fraunces itálica — solo para la palabra emocional de cada
  sección (nunca en párrafos)
- **Mono:** JetBrains Mono — la "voz de los recibos": IDs, cifras, labels
- **Colores** (`app/globals.css`, bloque `@theme`): ember `#cf3b18`, navy
  `#041429`, bone `#f5f1ea`, sol `#e7b140`, verde `#338a66`, entre otros

## 10. Estructura del proyecto

```
app/
  page.tsx                 → landing page pública
  admin/                   → panel de admin (protegido)
  api/
    waitlist/route.ts      → POST público: guarda una inscripción
    waitlist/me/route.ts   → GET público: tu posición, dado tu código
    counter/route.ts       → GET público: número + si está visible
    admin/                 → login, logout, listado y ajustes (protegidos)
components/
  sections/                → secciones de la landing (Hero, Beneficios, ...)
  GradientWaves.tsx         → fondo del hero (WebGL)
  WaitlistForm.tsx          → formulario + confirmación con link de referido
  Counter.tsx                → contador público (togglable)
  ScrollAnimations.tsx      → reveals de scroll con GSAP
lib/
  supabase-server.ts        → cliente de Supabase (solo servidor)
  adminAuth.ts               → login por contraseña compartida
  referral.ts                → generador de códigos de referido
middleware.ts                → protege /admin y /api/admin
supabase/schema.sql          → esquema de la base de datos (proyecto nuevo)
supabase/migration-referrals.sql → migración (si ya tenías la tabla vieja)
```
