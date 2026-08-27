-- RidePerks — esquema de la lista de espera (con cola de referidos)
-- Copia y pega esto en el SQL Editor de tu proyecto de Supabase
-- (Supabase Dashboard -> SQL Editor -> New query) y dale "Run".
--
-- Si ya habías corrido una versión anterior de este archivo (sin
-- referidos/email), corre en su lugar supabase/migration-referrals.sql,
-- que actualiza una tabla existente sin perder datos.

create extension if not exists "pgcrypto";

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  -- WhatsApp y plataforma son opcionales (igual que en rideperks.app).
  whatsapp text,
  platform text check (platform in ('uber', 'indrive', 'pedidosya', 'multiple')),

  -- Cola de referidos: cada inscrito recibe un código propio para
  -- compartir (?ref=CODIGO). Quien invita más gente sube en la fila.
  referral_code text not null unique,
  referred_by text references waitlist (referral_code) on delete set null,

  -- "pending" hasta que alguien del equipo confirme al conductor
  -- (por ejemplo por WhatsApp o revisando su perfil). No hay subida de
  -- documentos todavía — es una verificación manual simple.
  status text not null default 'pending' check (status in ('pending', 'verified', 'rejected')),
  created_at timestamptz not null default now()
);

-- Evita inscripciones duplicadas por correo (sin importar mayúsculas).
create unique index if not exists waitlist_email_key on waitlist (lower(email));
create unique index if not exists waitlist_referral_code_key on waitlist (referral_code);
create index if not exists waitlist_referred_by_idx on waitlist (referred_by);

-- Vista con la posición en la fila: más referidos = más arriba;
-- en caso de empate, quien se anotó primero va antes.
create or replace view waitlist_ranked as
select
  w.*,
  coalesce(r.referral_count, 0) as referral_count,
  row_number() over (
    order by coalesce(r.referral_count, 0) desc, w.created_at asc
  ) as position
from waitlist w
left join (
  select referred_by, count(*) as referral_count
  from waitlist
  where referred_by is not null
  group by referred_by
) r on r.referred_by = w.referral_code;

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
-- Las vistas heredan la seguridad de sus tablas base, así que
-- waitlist_ranked queda igual de protegida.
alter table waitlist enable row level security;
alter table app_settings enable row level security;
