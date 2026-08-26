# Entregar este proyecto a tu hermano

Guía rápida para pasarle el código y que él conecte Supabase + su dominio en Vercel.

## 1. Sube el código a GitHub (tú)

Si no tienes cuenta de GitHub o el CLI `gh` instalado, hazlo desde la web:

1. Ve a [github.com/new](https://github.com/new), crea un repositorio **privado** (por ejemplo `rideperks-landing`). No lo inicialices con README/gitignore (ya los tenemos).
2. En tu terminal, dentro de esta carpeta:

```bash
git remote add origin https://github.com/TU-USUARIO/rideperks-landing.git
git branch -M main
git push -u origin main
```

(Si prefieres el CLI: `gh auth login`, luego `gh repo create rideperks-landing --private --source=. --push`.)

El repo no tiene ningún secreto adentro — `.env.local` nunca se sube (está en `.gitignore`). Es seguro compartirlo.

## 2. Transfiere el repositorio a la cuenta de tu hermano

1. En GitHub, entra al repo → **Settings** → baja hasta **Danger Zone** → **Transfer ownership**.
2. Escribe el **usuario de GitHub de tu hermano** y confirma.
3. Tu hermano recibirá una notificación/correo para aceptar la transferencia — debe aceptarla para que el repo pase a ser suyo.
4. Una vez aceptada, el repo vive en su cuenta. Si quieres seguir aportando cambios, pídele que te agregue como colaborador (Settings → Collaborators) en el repo ya transferido.

## 3. Lo que tu hermano hace desde aquí (con el repo ya en su cuenta)

Todo esto ya está explicado paso a paso en **[README.md](README.md)** — solo tiene que seguirlo en orden:

1. **Supabase** (README, sección 2): crea el proyecto, corre `supabase/schema.sql` en el SQL Editor, copia `SUPABASE_URL` y la `service_role key`.
2. **Vercel** (README, sección 5):
   - [vercel.com](https://vercel.com) → **New Project** → importa el repo (ya en su GitHub).
   - En **Environment Variables**, agrega las 4 variables (ver `.env.local.example`):
     `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`.
     Para `ADMIN_PASSWORD` puede reutilizar la que ya te compartí por otro medio (no la
     pongas por escrito aquí ni en ningún archivo del repo), o definir una propia — es
     la que van a usar ambos para entrar a `/admin`. `ADMIN_SESSION_SECRET` puede ser
     cualquier cadena larga aleatoria (`openssl rand -hex 32`).
   - **Deploy**.
3. **Conectar su dominio ya comprado**:
   - En el proyecto de Vercel → **Settings → Domains** → agrega su dominio (ej. `rideperks.app`).
   - Vercel le muestra qué registro DNS agregar (`A` o `CNAME`, según el dominio). Lo agrega en el panel de su proveedor de dominio (Namecheap, GoDaddy, etc.).
   - La propagación DNS puede tardar de minutos a un par de horas.

De ahí en adelante, cada `git push` a `main` despliega automáticamente en Vercel.

## 4. Panel de administración

Una vez desplegado: `https://su-dominio.com/admin` — contraseña definida en `ADMIN_PASSWORD`. Desde ahí ve la lista de espera y prende/apaga el contador público.
