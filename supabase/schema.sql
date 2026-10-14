-- À coller dans Supabase > SQL Editor > New query, puis "Run".

-- Un profil par candidat (données de l'entretien, photo, candidatures)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb,
  photo text default '',
  apps jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profil lisible par son propriétaire" on public.profiles;
drop policy if exists "profil créé par son propriétaire" on public.profiles;
drop policy if exists "profil modifié par son propriétaire" on public.profiles;
drop policy if exists "profil supprimé par son propriétaire" on public.profiles;
create policy "profil lisible par son propriétaire" on public.profiles for select using (auth.uid() = user_id);
create policy "profil créé par son propriétaire" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profil modifié par son propriétaire" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profil supprimé par son propriétaire" on public.profiles for delete using (auth.uid() = user_id);

-- Compteur d'appels IA par jour (limite le coût)
create table if not exists public.ai_usage (
  user_id uuid not null,
  day date not null default current_date,
  n int not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;  -- aucune policy : seul le serveur y accède

create or replace function public.bump_usage(uid uuid, lim int) returns boolean
language plpgsql security definer set search_path = public as $$
declare cur int;
begin
  insert into public.ai_usage(user_id, day, n) values (uid, current_date, 1)
  on conflict (user_id, day) do update set n = public.ai_usage.n + 1
  returning n into cur;
  return cur <= lim;
end $$;
revoke all on function public.bump_usage(uuid, int) from public, anon, authenticated;
