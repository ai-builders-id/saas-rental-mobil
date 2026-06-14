-- ════════════════════════════════════════════════════════════════════════
-- 0001_extras.sql — Yang tak bisa diekspresikan Drizzle:
--   • extension btree_gist (untuk exclusion constraint)
--   • FK profiles.id → auth.users.id (tabel milik Supabase)
--   • exclusion constraint cegah overbooking
--   • schema private (untuk helper RLS)
-- Idempoten: aman dijalankan ulang.
-- ════════════════════════════════════════════════════════════════════════

create extension if not exists "btree_gist";

create schema if not exists private;

-- FK profiles.id → auth.users.id (cascade saat user dihapus)
do $$ begin
  alter table public.profiles
    add constraint profiles_id_users_id_fk
    foreign key (id) references auth.users (id) on delete cascade;
exception when duplicate_object then null; end $$;

-- Cegah overbooking: tidak boleh ada rentang waktu bertumpuk untuk satu unit
-- pada booking yang masih "hidup" (pending/confirmed/active).
do $$ begin
  alter table public.bookings add constraint no_overlap_booking
    exclude using gist (
      vehicle_id with =,
      tstzrange(start_at, end_at, '[)') with &&
    ) where (status in ('pending', 'confirmed', 'active'));
exception when duplicate_object then null; end $$;
