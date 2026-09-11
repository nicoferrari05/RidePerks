// Build one copy/paste file from the canonical migrations; contains no credentials.
import { mkdir, readFile, writeFile } from "node:fs/promises";
const migrations = [
  "202609080001_driver_platform.sql",
  "202609080002_waitlist_privacy.sql",
  "202609090001_qr_short_codes.sql",
  "202609100001_yappy_memberships.sql",
  "202609110001_merchant_roles.sql",
  "202609110002_access_and_review.sql",
  "202609110003_close_profile.sql",
];
const parts = await Promise.all(
  migrations.map(
    async (name) =>
      "-- " +
      name +
      "\n" +
      (await readFile(
        new URL("../supabase/migrations/" + name, import.meta.url),
        "utf8",
      )),
  ),
);
const directory = new URL("../artifacts/", import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(
  new URL("ACTIVAR_RIDEPERKS.sql", directory),
  "-- RidePerks: ejecutar TODO este archivo en Supabase > SQL Editor > Run.\n" +
    "-- Proyecto: hiwjqsopvpzjgyzlyeht. Incluye las migraciones verificadas.\n" +
    "-- Se puede ejecutar nuevamente si alguna migracion ya fue aplicada.\n\n" +
    parts.join("\n\n") +
    "\n\nselect to_regclass('public.rp_profiles') as perfiles,\n" +
    "to_regclass('public.rp_settings') as configuracion,\n" +
    "has_table_privilege('anon', 'public.waitlist_ranked', 'select') as acceso_publico_waitlist;\n",
);
console.log("Ready: artifacts/ACTIVAR_RIDEPERKS.sql");
