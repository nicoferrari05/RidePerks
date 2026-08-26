-- RidePerks — esquema de la lista de espera
-- Copia y pega esto en el SQL Editor de tu proyecto de Supabase
-- (Supabase Dashboard -> SQL Editor -> New query) y dale "Run".
-- Se puede correr una sola vez en un proyecto nuevo.

create extension if not exists "pgcrypto";

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  platform text not null check (platform in ('uber', 'indrive')),
  whatsapp text not null,
  -- "pending" hasta que alguien del equipo confirme al conductor
  -- (por ejemplo llamándolo o revisando su perfil). No hay subida de
  -- documentos todavía — es una verificación manual simple.
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

-- Evita que el mismo número se registre dos veces.
create unique index if not exists waitlist_whatsapp_key on waitlist (whatsapp);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null
);

-- El contador público empieza apagado; se enciende desde /admin.
insert into app_settings (key, value)
values ('show_counter', 'false'::jsonb)
on conflict (key) do nothing;

-- Seguridad: activamos Row Level Security y NO creamos ninguna política.
-- Eso bloquea el acceso a cualquiera que use la "anon key" (el navegador).
-- Solo la "service_role key" (usada exclusivamente en el servidor de
-- Next.js, nunca en el navegador) puede leer o escribir estas tablas.
alter table waitlist enable row level security;
alter table app_settings enable row level security;
