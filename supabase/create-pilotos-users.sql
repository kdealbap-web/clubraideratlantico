-- ============================================================
-- Crear usuarios de auth (login por contraseña) para los PILOTOS.
-- Ejecutar en Supabase → SQL Editor.
--
-- Qué hace:
--   · Toma cada miembro rol = 'PILOTO_OFICIAL' con email y SIN usuario aún.
--   · Le crea el usuario en auth.users + auth.identities (password aleatoria).
--   · Vincula members.auth_user_id.
--   · Devuelve al final la tabla EMAIL + CONTRASEÑA para compartir.
--
-- Idempotente: re-ejecútalo cuando agregues pilotos nuevos (solo crea los que
-- falten). Las contraseñas se muestran en una tabla TEMPORAL: no quedan
-- guardadas en la base. Copia el resultado y compártelo por canal privado.
-- ============================================================

set search_path = public, extensions;

create extension if not exists pgcrypto with schema extensions;

drop table if exists pilotos_credenciales;
create temp table pilotos_credenciales (email text, password text, estado text);

do $$
declare
  r       record;
  v_uid   uuid;
  v_email text;
  v_pass  text;
begin
  for r in
    select id, email, nombre, apellido
    from public.members
    where rol = 'PILOTO_OFICIAL'
      and email is not null
      and btrim(email) <> ''
      and auth_user_id is null
    order by apellido, nombre
  loop
    v_email := lower(btrim(r.email));

    -- si ya hay un usuario con ese email, solo re-vincula y sigue
    if exists (select 1 from auth.users u where lower(u.email) = v_email) then
      update public.members m
        set auth_user_id = (select id from auth.users u where lower(u.email) = v_email limit 1)
        where m.id = r.id and m.auth_user_id is null;
      insert into pilotos_credenciales values (v_email, '(ya tenía usuario)', 'omitido');
      continue;
    end if;

    v_uid  := gen_random_uuid();
    -- contraseña aleatoria de 10 caracteres (sin caracteres ambiguos)
    v_pass := (
      select string_agg(
        substr('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789',
               (floor(random() * 58) + 1)::int, 1), '')
      from generate_series(1, 10)
    );

    begin
      insert into auth.users
        (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
         raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
         confirmation_token, recovery_token, email_change_token_new, email_change)
      values
        ('00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
         v_email, crypt(v_pass, gen_salt('bf')), now(),
         '{"provider":"email","providers":["email"]}'::jsonb,
         jsonb_build_object('nombre', r.nombre, 'apellido', r.apellido),
         now(), now(), '', '', '', '');

      insert into auth.identities
        (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values
        (gen_random_uuid(), v_uid, v_uid::text,
         jsonb_build_object('sub', v_uid::text, 'email', v_email),
         'email', now(), now(), now());

      update public.members set auth_user_id = v_uid where id = r.id;

      insert into pilotos_credenciales values (v_email, v_pass, 'creado');
    exception when others then
      insert into pilotos_credenciales values (v_email, null, 'ERROR: ' || sqlerrm);
    end;
  end loop;
end $$;

-- Resultado: comparte estas credenciales por canal privado.
select email, password, estado from pilotos_credenciales order by estado, email;
