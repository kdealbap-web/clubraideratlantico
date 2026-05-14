-- ============================================================
-- Club Raider Atlántico — schema inicial.
-- Crea tablas vacías. Solicitud completa (form público) exige todos
-- los campos. members (perfil) tolera campos vacíos para permitir
-- pre-seeds del comité — el admin completa datos faltantes desde el CMS.
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums ----------------------------------------------------------
do $$ begin
  create type rol_miembro as enum
    ('ADMINISTRADOR','LIDER','EDITOR','PILOTO_OFICIAL','CO_PILOTO','ASPIRANTE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_miembro as enum ('activo','pendiente','inactivo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_solicitud as enum ('pendiente','aprobada','rechazada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type experiencia_piloto as enum ('novato','intermedio','experimentado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_evento as enum ('borrador','publicado','realizado','cancelado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_noticia as enum ('borrador','publicado','archivado');
exception when duplicate_object then null; end $$;

-- members (perfil del piloto) ------------------------------------
-- Campos nullable permiten pre-seeds del comité antes de que el
-- piloto complete sus datos personales. UNIQUE en cédula y email
-- tolera NULL (cumple SQL standard).
create table if not exists public.members (
  id            uuid primary key default uuid_generate_v4(),
  auth_user_id  uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  nombre        text not null,
  apellido      text not null,
  cedula        text unique,
  fecha_nac     date,
  email         text not null unique,
  tel           text,
  ciudad        text,
  moto_marca    text,
  moto_modelo   text,
  moto_year     int,
  moto_placa    text,
  moto_color    text,
  alias         text,
  rol           rol_miembro    not null default 'ASPIRANTE',
  estado        estado_miembro not null default 'pendiente',
  ingreso       date,
  rodadas       int not null default 0,
  emergencia    jsonb
);

create index if not exists members_estado_idx on public.members(estado);
create index if not exists members_rol_idx    on public.members(rol);
create index if not exists members_auth_idx   on public.members(auth_user_id);

-- solicitudes (form público /unete) ------------------------------
-- Todos los campos requeridos: el piloto los completa antes de enviar.
create table if not exists public.solicitudes (
  id              uuid primary key default uuid_generate_v4(),
  created_at      timestamptz not null default now(),
  estado          estado_solicitud not null default 'pendiente',

  nombre          text not null,
  apellido        text not null,
  cedula          text not null,
  fecha_nac       date not null,
  email           text not null,
  tel             text not null,
  ciudad          text not null,

  moto_marca      text not null,
  moto_modelo     text not null,
  moto_year       int,
  moto_placa      text not null,
  moto_color      text,

  doc_propia      boolean not null,
  doc_tarjeta     boolean not null,
  doc_soat        boolean not null,
  doc_tecno       boolean not null,

  tiene_licencia  boolean not null default false,
  experiencia     experiencia_piloto not null,

  con_copiloto    boolean not null default false,
  co_nombre       text,
  co_apellido     text,
  co_cedula       text,
  co_fecha_nac    date,
  co_tel          text,

  motivo          text,

  acepta_reglamento boolean not null,
  acepta_datos      boolean not null,

  decided_at      timestamptz,
  decided_by      uuid references public.members(id) on delete set null,
  nota_decision   text
);

create index if not exists solicitudes_estado_idx  on public.solicitudes(estado);
create index if not exists solicitudes_created_idx on public.solicitudes(created_at desc);

-- events ---------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  titulo      text not null,
  descripcion text not null default '',
  fecha       date not null,
  hora        text not null,
  salida      text not null,
  ruta        text not null default '',
  cupos       int not null default 0,
  inscritos   int not null default 0,
  estado      estado_evento not null default 'borrador',
  dificultad  text not null default '—',
  tipo        text not null default 'Rodada',
  km          int not null default 0
);

create index if not exists events_estado_idx on public.events(estado);
create index if not exists events_fecha_idx  on public.events(fecha desc);

-- news -----------------------------------------------------------
create table if not exists public.news (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  titulo      text not null,
  resumen     text not null default '',
  contenido   text not null default '',
  autor       text not null,
  fecha       date not null default current_date,
  estado      estado_noticia not null default 'borrador',
  tags        text[] not null default '{}',
  cover_url   text
);

create index if not exists news_estado_idx on public.news(estado);

-- gallery --------------------------------------------------------
create table if not exists public.gallery (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  label         text not null,
  cat           text not null default 'General',
  ratio         numeric not null default 1.5,
  fav           boolean not null default false,
  url           text not null,
  storage_path  text not null
);

create index if not exists gallery_cat_idx on public.gallery(cat);

-- settings -------------------------------------------------------
create table if not exists public.settings (
  id          int primary key default 1,
  payload     jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

-- activity_log ---------------------------------------------------
create table if not exists public.activity_log (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  who         text not null,
  what        text not null,
  target      text,
  kind        text not null
);

create index if not exists activity_kind_idx     on public.activity_log(kind);
create index if not exists activity_created_idx  on public.activity_log(created_at desc);

-- Trigger: auto-link auth.users.id con members.auth_user_id por email
-- al primer login (magic link). Si el email no existe en members, no hace nada.
create or replace function public.link_auth_user_to_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.members
  set auth_user_id = new.id
  where email = new.email
    and auth_user_id is null;
  return new;
end $$;

drop trigger if exists trg_link_auth_user on auth.users;
create trigger trg_link_auth_user
after insert or update of email on auth.users
for each row
execute function public.link_auth_user_to_member();

-- También sembrar back-link para los 6 auth.users que ya existen
-- (se ejecuta después de 0003_seed_admin que crea las filas):
-- (no aquí — viene en 0003 al final, después del INSERT)
