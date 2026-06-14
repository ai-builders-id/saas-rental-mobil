<script setup lang="ts">
const { init } = useRentalData()
onMounted(() => init())
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1 class="page-title">Laporan &amp; Analitik</h1>
        <p class="page-desc">Utilisasi armada, pendapatan per cabang, dan laporan pajak</p>
      </div>
      <div class="row gap-8">
        <RButton variant="ghost" icon="download">Ekspor Laporan</RButton>
        <RButton variant="primary" icon="sparkles">Buat Laporan</RButton>
      </div>
    </div>

    <!-- Report Type Cards -->
    <div class="grid-stats" style="margin-bottom: 16px;">
      <StatCard label="Utilisasi Armada" :value="'65%'" icon="gauge" tone="available">
        <template #sub><span class="muted">12 unit tersedia / 23 total</span></template>
      </StatCard>
      <StatCard label="Pendapatan Bulan Ini" :value="'Rp 45,2 jt'" icon="wallet" tone="primary">
        <template #sub><span class="delta up">+12.4% vs bulan lalu</span></template>
      </StatCard>
      <StatCard label="Booking via WA" :value="'58%'" icon="message-circle" tone="booked">
        <template #sub><span class="muted">dari total 42 booking</span></template>
      </StatCard>
      <StatCard label="Rata-rata Sewa" :value="'3.2 hari'" icon="calendar" tone="onrent">
        <template #sub><span class="muted">durasi rata-rata</span></template>
      </StatCard>
    </div>

    <!-- Empty state untuk konten detail -->
    <div class="empty" style="margin-top: 32px;">
      <span class="empty-ico"><RIcon name="chart-column" :size="26" /></span>
      <h2>Laporan detail siap pakai</h2>
      <p>Laporan utilisasi armada, pendapatan per cabang, dan laporan pajak akan tampil di sini. Pilih jenis laporan dan periode untuk mulai.</p>
      <div class="row gap-8">
        <RButton variant="primary" icon="sparkles">Lihat pratinjau</RButton>
        <RButton variant="ghost">Pelajari</RButton>
      </div>
    </div>
  </div>
</template>
