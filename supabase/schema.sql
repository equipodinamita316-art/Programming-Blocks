-- BLOCKWEB schema (ejecutar en Supabase SQL editor)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  avatar text,
  xp int default 0,
  nivel text default 'Novato Bloque',
  created_at timestamptz default now()
);

create table if not exists cursos (
  id text primary key,
  slug text unique not null,
  titulo text not null,
  descripcion text
);

create table if not exists lecciones (
  id text primary key,
  curso_id text references cursos(id),
  orden int,
  titulo text,
  dificultad text default 'Facil' check (dificultad in ('Facil','Media','Dificil','Boss')),
  xp int default 50,
  mision text,
  concepto text,
  codigo_inicial text,
  solucion text,
  lab_libre jsonb default '[]',
  boss text,
  boss_roto text,
  pistas jsonb default '[]',
  quiz jsonb default '[]'
);

create table if not exists progreso_lecciones (
  user_id uuid references profiles(id),
  leccion_id text references lecciones(id),
  completada bool default false,
  xp_ganada int default 0,
  updated_at timestamptz default now(),
  primary key (user_id, leccion_id)
);

create table if not exists certificados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  codigo_unico text unique not null,
  url_pdf text,
  nota int,
  created_at timestamptz default now()
);

create table if not exists proyectos_bloques (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  nombre text,
  bloques_json jsonb,
  html_generado text,
  publicado bool default false,
  slug_publico text unique,
  created_at timestamptz default now()
);

-- RLS básico
alter table profiles enable row level security;
alter table progreso_lecciones enable row level security;
alter table certificados enable row level security;
alter table proyectos_bloques enable row level security;

drop policy if exists "perfil propio" on profiles;
drop policy if exists "progreso propio" on progreso_lecciones;
drop policy if exists "cert solo dueño" on certificados;
drop policy if exists "proyectos públicos legibles" on proyectos_bloques;
create policy "perfil propio" on profiles for all using (auth.uid() = id);
create policy "progreso propio" on progreso_lecciones for all using (auth.uid() = user_id);
-- Certificados: nadie lee la tabla directa; solo la función verify_cert por código.
drop policy if exists "cert propio + lectura pública por código" on certificados;
create policy "cert solo dueño" on certificados for select using (auth.uid() = user_id);
create policy "proyectos públicos legibles" on proyectos_bloques for select using (publicado = true or auth.uid() = user_id);

-- Verificación pública mínima: devuelve solo nombre/nota/fecha del código pedido.
create or replace function verify_cert(p_codigo text)
returns table (nombre text, nota int, fecha timestamptz, codigo text)
language sql security definer set search_path = public as $$
  select p.nombre, c.nota, c.created_at, c.codigo_unico
  from certificados c join profiles p on p.id = c.user_id
  where lower(c.codigo_unico) = lower(p_codigo) limit 1;
$$;

-- Perfil automático al registrarse (email o Google)
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, nombre, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- Escritura propia explícita (inserts con user_id = auth.uid())
drop policy if exists "progreso inserta propio" on progreso_lecciones;
drop policy if exists "proyectos inserta propio" on proyectos_bloques;
drop policy if exists "cert inserta propio" on certificados;
drop policy if exists "perfil inserta propio" on profiles;
create policy "progreso inserta propio" on progreso_lecciones for insert with check (auth.uid() = user_id);
create policy "proyectos inserta propio" on proyectos_bloques for insert with check (auth.uid() = user_id);
create policy "cert inserta propio" on certificados for insert with check (auth.uid() = user_id);
create policy "perfil inserta propio" on profiles for insert with check (auth.uid() = id);

-- Storage assets: lectura pública, subida solo logueado
drop policy if exists "assets lectura pública" on storage.objects;
drop policy if exists "assets subida propia" on storage.objects;
drop policy if exists "assets borra propia" on storage.objects;
create policy "assets lectura pública" on storage.objects for select using (bucket_id = 'assets');
create policy "assets subida propia" on storage.objects for insert with check (bucket_id = 'assets' and auth.role() = 'authenticated');
create policy "assets borra propia" on storage.objects for delete using (bucket_id = 'assets' and auth.role() = 'authenticated');

-- Seed mínimo
insert into cursos (id, slug, titulo, descripcion) values
('html','html','HTML','Estructura'),
('css','css','CSS','Estilo'),
('js','js','JavaScript','Lógica')
on conflict (id) do nothing;
