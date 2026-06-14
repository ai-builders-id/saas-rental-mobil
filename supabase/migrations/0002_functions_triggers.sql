-- ════════════════════════════════════════════════════════════════════════
-- 0002_functions_triggers.sql — helper tenant, updated_at, sinkron status armada
-- ════════════════════════════════════════════════════════════════════════

-- ── Helper: tenant_id user saat ini (dipakai semua policy RLS) ───────────
-- SECURITY DEFINER + search_path kosong (best practice keamanan Supabase).
-- Berada di schema private agar tidak ter-expose ke Data API.
create or replace function private.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select tenant_id from public.profiles where id = (select auth.uid());
$$;

-- Helper: role user saat ini
create or replace function private.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

-- Akses helper hanya untuk role authenticated (bukan anon/public)
revoke all on function private.current_tenant_id() from public, anon;
revoke all on function private.current_role() from public, anon;
grant execute on function private.current_tenant_id() to authenticated;
grant execute on function private.current_role() to authenticated;

-- ── Generic: set updated_at = now() pada UPDATE ─────────────────────────
create or replace function private.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Pasang trigger updated_at ke semua tabel ber-updated_at
do $$
declare t text;
begin
  foreach t in array array[
    'tenants','profiles','branches','vehicles','vehicle_documents',
    'maintenance_records','customers','bookings','payments'
  ] loop
    execute format('drop trigger if exists trg_set_updated_at on public.%I;', t);
    execute format(
      'create trigger trg_set_updated_at before update on public.%I
       for each row execute function private.set_updated_at();', t);
  end loop;
end $$;

-- ── Sinkron status armada mengikuti perubahan status booking ────────────
-- confirmed → vehicle 'booked'; active → 'on_rent';
-- completed → 'inspection'; canceled → 'available' (jika tak ada booking aktif lain).
create or replace function private.sync_vehicle_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (tg_op = 'UPDATE' and new.status is distinct from old.status)
     or tg_op = 'INSERT' then
    if new.status = 'confirmed' then
      update public.vehicles set status = 'booked' where id = new.vehicle_id;
    elsif new.status = 'active' then
      update public.vehicles set status = 'on_rent' where id = new.vehicle_id;
    elsif new.status = 'completed' then
      update public.vehicles set status = 'inspection' where id = new.vehicle_id;
    elsif new.status = 'canceled' then
      -- kembalikan ke available hanya bila tak ada booking hidup lain untuk unit ini
      if not exists (
        select 1 from public.bookings b
        where b.vehicle_id = new.vehicle_id
          and b.id <> new.id
          and b.status in ('pending','confirmed','active')
      ) then
        update public.vehicles set status = 'available'
        where id = new.vehicle_id and status in ('booked','on_rent');
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_vehicle_status on public.bookings;
create trigger trg_sync_vehicle_status
  after insert or update of status on public.bookings
  for each row execute function private.sync_vehicle_status();
