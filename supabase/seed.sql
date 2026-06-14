-- ════════════════════════════════════════════════════════════════════════
-- seed.sql — Data demo (opsional) untuk pengujian frontend
-- Dijalankan via: npm run db:seed
-- Catatan: seed ini TIDAK membuat auth user. Hubungkan profil ke tenant demo
-- lewat endpoint /api/auth/bootstrap atau script test (service role).
-- ════════════════════════════════════════════════════════════════════════

-- Tenant demo dengan id tetap agar mudah direferensikan
insert into public.tenants (id, name, address, phone, email, wa_number,
                            subscription_tier, subscription_status, trial_ends_at)
values (
  '00000000-0000-0000-0000-0000000000aa',
  'Rajawali Rentcar (Demo)',
  'Jl. Merdeka No. 1, Jakarta',
  '021-5550100',
  'demo@rajawalirent.id',
  '628120000000',
  'pro', 'trialing', now() + interval '14 days'
)
on conflict (id) do nothing;

-- Dua cabang
insert into public.branches (id, tenant_id, name, address, phone, status)
values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000aa',
   'Cabang Jakarta', 'Jl. Sudirman No. 10, Jakarta', '021-5550101', 'active'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000aa',
   'Cabang Bekasi', 'Jl. Ahmad Yani No. 5, Bekasi', '021-5550102', 'active')
on conflict (id) do nothing;

-- Beberapa kendaraan
insert into public.vehicles (tenant_id, branch_id, brand, model, year, plate_no,
                             color, price_daily, price_weekly, price_monthly, status)
values
  ('00000000-0000-0000-0000-0000000000aa','00000000-0000-0000-0000-0000000000b1',
   'Toyota','Avanza',2022,'B 1234 XYZ','Silver',350000,2000000,7000000,'available'),
  ('00000000-0000-0000-0000-0000000000aa','00000000-0000-0000-0000-0000000000b1',
   'Honda','Brio',2023,'B 5678 ABC','Putih',300000,1750000,6000000,'available'),
  ('00000000-0000-0000-0000-0000000000aa','00000000-0000-0000-0000-0000000000b2',
   'Daihatsu','Xenia',2021,'B 9012 DEF','Hitam',330000,1900000,6500000,'maintenance')
on conflict (tenant_id, plate_no) do nothing;

-- Pelanggan contoh
insert into public.customers (tenant_id, name, phone, email, address, status, rating)
values
  ('00000000-0000-0000-0000-0000000000aa','Andi Wijaya','628121111111','andi@email.com','Jakarta Selatan','active',4.5),
  ('00000000-0000-0000-0000-0000000000aa','Budi Santoso','628122222222','budi@email.com','Bekasi','active',4.0)
on conflict (tenant_id, phone) do nothing;
