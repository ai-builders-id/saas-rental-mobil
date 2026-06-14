-- ════════════════════════════════════════════════════════════════════════
-- 0004_storage.sql — Storage buckets (privat) + RLS berbasis path tenant
-- ════════════════════════════════════════════════════════════════════════
-- Konvensi path objek: "<tenant_id>/<...>"  → segmen pertama = tenant_id.
-- storage.foldername(name)[1] memberi segmen pertama untuk dicocokkan ke tenant.
-- Semua bucket privat: akses via signed URL dari server.
-- ════════════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values
  ('vehicle-photos', 'vehicle-photos', false),
  ('vehicle-docs',   'vehicle-docs',   false),
  ('customer-docs',  'customer-docs',  false),  -- KTP/SIM (restricted PII)
  ('tenant-logos',   'tenant-logos',   false)
on conflict (id) do nothing;

-- Helper inline: cek apakah segmen pertama path == tenant user saat ini
-- (ditulis langsung di policy agar tetap sederhana).

do $$
declare b text;
begin
  foreach b in array array['vehicle-photos','vehicle-docs','customer-docs','tenant-logos'] loop
    -- SELECT
    execute format('drop policy if exists "%1$s_select" on storage.objects;', b);
    execute format($f$
      create policy "%1$s_select" on storage.objects
        for select to authenticated
        using (
          bucket_id = %1$L
          and (storage.foldername(name))[1] = private.current_tenant_id()::text
        );
    $f$, b);

    -- INSERT
    execute format('drop policy if exists "%1$s_insert" on storage.objects;', b);
    execute format($f$
      create policy "%1$s_insert" on storage.objects
        for insert to authenticated
        with check (
          bucket_id = %1$L
          and (storage.foldername(name))[1] = private.current_tenant_id()::text
        );
    $f$, b);

    -- UPDATE (upsert butuh select+insert+update)
    execute format('drop policy if exists "%1$s_update" on storage.objects;', b);
    execute format($f$
      create policy "%1$s_update" on storage.objects
        for update to authenticated
        using (
          bucket_id = %1$L
          and (storage.foldername(name))[1] = private.current_tenant_id()::text
        )
        with check (
          bucket_id = %1$L
          and (storage.foldername(name))[1] = private.current_tenant_id()::text
        );
    $f$, b);

    -- DELETE
    execute format('drop policy if exists "%1$s_delete" on storage.objects;', b);
    execute format($f$
      create policy "%1$s_delete" on storage.objects
        for delete to authenticated
        using (
          bucket_id = %1$L
          and (storage.foldername(name))[1] = private.current_tenant_id()::text
        );
    $f$, b);
  end loop;
end $$;
