-- Portfolio & CV initial schema migration

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  section text not null check (section in ('design', 'websites')),
  title jsonb not null default '{"en":"","uk":"","pl":"","ru":""}'::jsonb,
  description jsonb not null default '{"en":"","uk":"","pl":"","ru":""}'::jsonb,
  tags text[] not null default '{}',
  project_url text,
  github_url text,
  figma_url text,
  open_external_on_click boolean not null default false,
  cover_image text,
  gallery text[] not null default '{}',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_section_sort
  on public.projects (section, sort_order asc, created_at desc);

create index if not exists idx_projects_slug
  on public.projects (slug);

create index if not exists idx_site_content_key
  on public.site_content (key);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists trg_site_content_updated_at on public.site_content;
create trigger trg_site_content_updated_at
  before update on public.site_content
  for each row
  execute function public.set_updated_at();

alter table public.projects enable row level security;
alter table public.site_content enable row level security;

drop policy if exists "Public read published projects" on public.projects;
create policy "Public read published projects"
  on public.projects
  for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
  on public.site_content
  for select
  to anon, authenticated
  using (true);

insert into public.site_content (key, content)
values
  (
    'cv_data',
    '{
      "about": {"en": "", "uk": "", "pl": "", "ru": ""},
      "skillCategories": [],
      "education": [],
      "languages": []
    }'::jsonb
  ),
  (
    'settings',
    '{
      "availableForWork": true,
      "telegram": "",
      "email": "",
      "github": "",
      "figma": ""
    }'::jsonb
  ),
  (
    'profile_settings',
    '{
      "availableForWork": true,
      "telegram": "",
      "email": "",
      "github": "",
      "figma": ""
    }'::jsonb
  )
on conflict (key) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read portfolio images" on storage.objects;
create policy "Public read portfolio images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'portfolio-images');
