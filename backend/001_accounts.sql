-- Apply in the selected Supabase project before enabling AUTH_CONFIG.
-- Passwords live in Supabase Auth; this table never receives credentials.
begin;
create table if not exists public.collection_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (coalesce((
    jsonb_typeof(payload) = 'object' and
    payload->>'format' = 'tomitrack' and
    payload->>'schema' = '1' and
    jsonb_typeof(payload->'items') = 'array' and
    jsonb_array_length(payload->'items') <= 10000 and
    octet_length(payload::text) <= 12000000
  ),false)),
  updated_at timestamptz not null default now()
);
alter table public.collection_backups enable row level security;
alter table public.collection_backups force row level security;
revoke all on table public.collection_backups from anon;
revoke all on table public.collection_backups from authenticated;
grant select,insert,update,delete on table public.collection_backups to authenticated;
create policy "Owner reads backup" on public.collection_backups for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owner creates backup" on public.collection_backups for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owner updates backup" on public.collection_backups for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owner removes backup" on public.collection_backups for delete to authenticated using ((select auth.uid()) = user_id);
create or replace function public.touch_collection_backup() returns trigger language plpgsql set search_path = '' as $$ begin new.updated_at = now();return new;end; $$;
create trigger collection_backup_updated before update on public.collection_backups for each row execute function public.touch_collection_backup();
commit;
