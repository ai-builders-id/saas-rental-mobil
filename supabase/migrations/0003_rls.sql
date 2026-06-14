-- ════════════════════════════════════════════════════════════════════════
-- 0003_rls.sql — Row Level Security: isolasi per-tenant pada semua tabel
-- ════════════════════════════════════════════════════════════════════════
-- Pola:
--   SELECT/DELETE : USING (tenant_id = private.current_tenant_id())
--   INSERT        : WITH CHECK (tenant_id = private.current_tenant_id())
--   UPDATE        : USING (...) WITH CHECK (...)  ← keduanya wajib
--   Selalu TO authenticated (bukan anon).
-- Catatan: service_role (server) BYPASS RLS — operasi privileged difilter manual.
-- ════════════════════════════════════════════════════════════════════════

-- Aktifkan RLS di semua tabel
alter table public.tenants               enable row level security;
alter table public.profiles              enable row level security;
alter table public.branches              enable row level security;
alter table public.vehicles              enable row level security;
alter table public.vehicle_documents     enable row level security;
alter table public.maintenance_records   enable row level security;
alter table public.customers             enable row level security;
alter table public.bookings              enable row level security;
alter table public.payments              enable row level security;

-- ── tenants ─────────────────────────────────────────────────────────────
-- Anggota tenant boleh melihat & meng-update tenant-nya sendiri (id = current).
drop policy if exists tenants_select on public.tenants;
create policy tenants_select on public.tenants
  for select to authenticated
  using (id = private.current_tenant_id());

drop policy if exists tenants_update on public.tenants;
create policy tenants_update on public.tenants
  for update to authenticated
  using (id = private.current_tenant_id())
  with check (id = private.current_tenant_id());

-- INSERT tenant TIDAK diizinkan dari client (dibuat via service role saat bootstrap).

-- ── profiles ────────────────────────────────────────────────────────────
-- Lihat anggota dalam tenant yang sama; user boleh update profil dirinya.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (tenant_id = private.current_tenant_id());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and tenant_id = private.current_tenant_id());

-- Manajemen staff (insert/update/delete profil lain) dilakukan via service role
-- pada endpoint server dengan guard role owner/admin.

-- ── Makro policy CRUD penuh per-tenant untuk tabel bisnis ───────────────
do $$
declare t text;
begin
  foreach t in array array[
    'branches','vehicles','vehicle_documents','maintenance_records',
    'customers','bookings','payments'
  ] loop
    execute format('drop policy if exists %1$s_select on public.%1$s;', t);
    execute format($f$
      create policy %1$s_select on public.%1$s
        for select to authenticated
        using (tenant_id = private.current_tenant_id());
    $f$, t);

    execute format('drop policy if exists %1$s_insert on public.%1$s;', t);
    execute format($f$
      create policy %1$s_insert on public.%1$s
        for insert to authenticated
        with check (tenant_id = private.current_tenant_id());
    $f$, t);

    execute format('drop policy if exists %1$s_update on public.%1$s;', t);
    execute format($f$
      create policy %1$s_update on public.%1$s
        for update to authenticated
        using (tenant_id = private.current_tenant_id())
        with check (tenant_id = private.current_tenant_id());
    $f$, t);

    execute format('drop policy if exists %1$s_delete on public.%1$s;', t);
    execute format($f$
      create policy %1$s_delete on public.%1$s
        for delete to authenticated
        using (tenant_id = private.current_tenant_id());
    $f$, t);
  end loop;
end $$;
