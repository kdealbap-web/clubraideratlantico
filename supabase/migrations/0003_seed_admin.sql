-- ============================================================
-- Seed: 6 miembros reales + 1 buzón genérico del club.
--
-- Estrategia:
--   - Kevin (kdealbap@gmail.com)  → ADMINISTRADOR · activo
--   - 5 emails preregistrados      → PILOTO_OFICIAL · activo (sin datos personales aún)
--   - admin@clubraideratlantico.com → ADMINISTRADOR · activo (buzón genérico, sin auth.user)
--
-- El trigger `trg_link_auth_user` (0001) vinculará auth_user_id automáticamente
-- cuando cada email haga login con magic link. Para los 6 ya creados,
-- forzamos el back-link al final de esta migration.
-- ============================================================

-- Kevin admin
insert into public.members (nombre, apellido, email, alias, rol, estado, ingreso)
values ('Kevin', 'De Alba P', 'kdealbap@gmail.com', 'KD', 'ADMINISTRADOR', 'activo', current_date)
on conflict (email) do nothing;

-- 5 pilotos pre-registrados (datos personales los completa el admin desde el CMS)
insert into public.members (nombre, apellido, email, rol, estado, ingreso) values
  ('Julio',     'Ramírez',        'ramirezjulio0925@gmail.com',        'PILOTO_OFICIAL', 'activo', current_date),
  ('B.',        'Molinares',      'bmolinares94@gmail.com',            'PILOTO_OFICIAL', 'activo', current_date),
  ('Carlos',    'Larrarte',       'larrartecarlos0@gmail.com',         'PILOTO_OFICIAL', 'activo', current_date),
  ('Alejandro', 'Villanueva Orozco', 'alejandro.villanuevaorozco@gmail.com', 'PILOTO_OFICIAL', 'activo', current_date),
  ('Dainis',    'Gómez',          'dainisgomez2006@gmail.com',         'PILOTO_OFICIAL', 'activo', current_date)
on conflict (email) do nothing;

-- Buzón genérico del club (recibe notificaciones Lark de solicitudes nuevas).
-- NO está vinculado a auth.users — es solo destinatario.
insert into public.members (nombre, apellido, email, rol, estado, ingreso)
values ('Admin', 'Club', 'admin@clubraideratlantico.com', 'ADMINISTRADOR', 'activo', current_date)
on conflict (email) do nothing;

-- Settings singleton
insert into public.settings (id, payload) values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- Back-link forzado de los auth.users existentes (los 6 ya creados antes del trigger)
update public.members m
set auth_user_id = u.id
from auth.users u
where m.email = u.email
  and m.auth_user_id is null;

-- Diagnóstico al final (aparece en el output del SQL Editor)
do $$
declare
  n_members   int;
  n_linked    int;
  n_admins    int;
  n_pilotos   int;
begin
  select count(*) into n_members  from public.members;
  select count(*) into n_linked   from public.members where auth_user_id is not null;
  select count(*) into n_admins   from public.members where rol = 'ADMINISTRADOR';
  select count(*) into n_pilotos  from public.members where rol = 'PILOTO_OFICIAL';
  raise notice 'Seed completado: % miembros, % vinculados a auth, % admins, % pilotos oficiales',
    n_members, n_linked, n_admins, n_pilotos;
end $$;
