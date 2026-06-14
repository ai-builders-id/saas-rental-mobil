/* ============================================================
   Rajawali Rentcar — mock data for the SaaS prototype
   Attached to window.DATA
   ============================================================ */
(function () {
  const STATUS = {
    AVAILABLE:   { id: "AVAILABLE",   label: "Tersedia",    tone: "available"  },
    BOOKED:      { id: "BOOKED",      label: "Dibooking",   tone: "booked"     },
    ON_RENT:     { id: "ON_RENT",     label: "Disewa",      tone: "onrent"     },
    INSPECTION:  { id: "INSPECTION",  label: "Inspeksi",    tone: "inspection" },
    MAINTENANCE: { id: "MAINTENANCE", label: "Servis",      tone: "maintenance"},
  };

  const branches = [
    { id: "jkt", name: "Cabang Jakarta", short: "Jakarta", units: 11 },
    { id: "bks", name: "Cabang Bekasi",  short: "Bekasi",  units: 7  },
    { id: "dpk", name: "Cabang Depok",   short: "Depok",   units: 5  },
  ];

  // representative page-1 of the fleet (23 total)
  const vehicles = [
    { id:"v01", merk:"Toyota",     model:"Avanza",        year:2022, plate:"B 1234 XYZ", color:"Putih",  branch:"jkt", status:"AVAILABLE",   day:350000, odo:48210, driver:null },
    { id:"v02", merk:"Honda",      model:"Brio",          year:2023, plate:"B 5678 ABC", color:"Merah",  branch:"bks", status:"ON_RENT",     day:300000, odo:21940, driver:"Andi Wijaya" },
    { id:"v03", merk:"Daihatsu",   model:"Xenia",         year:2021, plate:"B 9012 DEF", color:"Silver", branch:"jkt", status:"MAINTENANCE", day:320000, odo:67500, driver:null },
    { id:"v04", merk:"Toyota",     model:"Innova Reborn", year:2022, plate:"B 1122 GHI", color:"Hitam",  branch:"jkt", status:"ON_RENT",     day:600000, odo:53110, driver:"Budi Santoso" },
    { id:"v05", merk:"Mitsubishi", model:"Xpander",       year:2023, plate:"B 3344 JKL", color:"Putih",  branch:"dpk", status:"AVAILABLE",   day:450000, odo:18020, driver:null },
    { id:"v06", merk:"Toyota",     model:"Avanza",        year:2020, plate:"B 5566 MNO", color:"Abu-abu",branch:"bks", status:"BOOKED",      day:330000, odo:71230, driver:null },
    { id:"v07", merk:"Suzuki",     model:"Ertiga",        year:2021, plate:"B 7788 PQR", color:"Putih",  branch:"jkt", status:"AVAILABLE",   day:350000, odo:42880, driver:null },
    { id:"v08", merk:"Honda",      model:"Mobilio",       year:2019, plate:"B 9900 STU", color:"Silver", branch:"dpk", status:"INSPECTION",  day:300000, odo:88450, driver:null },
    { id:"v09", merk:"Toyota",     model:"Fortuner",      year:2023, plate:"B 2468 VWX", color:"Hitam",  branch:"jkt", status:"ON_RENT",     day:850000, odo:29760, driver:"Citra Lestari" },
    { id:"v10", merk:"Daihatsu",   model:"Terios",        year:2022, plate:"B 1357 YZA", color:"Putih",  branch:"bks", status:"AVAILABLE",   day:400000, odo:33910, driver:null },
    { id:"v11", merk:"Wuling",     model:"Confero",       year:2021, plate:"B 8642 BCD", color:"Merah",  branch:"dpk", status:"AVAILABLE",   day:280000, odo:50120, driver:null },
    { id:"v12", merk:"Toyota",     model:"Hiace Premio",  year:2022, plate:"B 9753 EFG", color:"Putih",  branch:"jkt", status:"BOOKED",      day:1200000,odo:61040, driver:null },
  ];

  // fleet summary (across all 23 units) for the dashboard stat cards
  const summary = {
    total: 23,
    available: 12,
    onRent: 8,
    maintenance: 3,
    revenueMonth: 45200000,
    revenueDelta: 12.4,        // % vs last month
    utilization: 65,           // %
    bookingsToday: 6,
    waShare: 58,               // % bookings via WhatsApp
  };

  // active rentals (Sewa Aktif) — on-rent units with due times
  const activeRentals = [
    { id:"r1", plate:"B 5678 ABC", vehicle:"Honda Brio",      customer:"Andi Wijaya",   branch:"Bekasi",  due:"Hari ini · 18:00", overdue:false, progress:88, channel:"wa" },
    { id:"r2", plate:"B 1122 GHI", vehicle:"Toyota Innova",   customer:"Budi Santoso",  branch:"Jakarta", due:"15 Jun · 10:00",   overdue:false, progress:54, channel:"manual" },
    { id:"r3", plate:"B 2468 VWX", vehicle:"Toyota Fortuner", customer:"Citra Lestari", branch:"Jakarta", due:"16 Jun · 12:00",   overdue:false, progress:31, channel:"wa" },
    { id:"r4", plate:"B 4411 KMN", vehicle:"Suzuki APV",      customer:"Eko Prasetyo",  branch:"Depok",   due:"Kemarin · 20:00",  overdue:true,  progress:100, channel:"manual" },
  ];

  // alerts feed
  const alerts = [
    { id:"a1", sev:"error",   icon:"alarm-clock",   title:"Sewa jatuh tempo hari ini",     desc:"B 5678 ABC · Honda Brio · Andi W. · 18:00", time:"2 jam lagi" },
    { id:"a2", sev:"error",   icon:"file-warning",  title:"STNK akan kedaluwarsa",         desc:"B 1234 XYZ · Toyota Avanza · jatuh tempo 20 Jun", time:"6 hari" },
    { id:"a3", sev:"warning", icon:"wrench",        title:"Servis berkala jatuh tempo",    desc:"B 9012 DEF · Daihatsu Xenia · ganti oli", time:"Besok" },
    { id:"a4", sev:"warning", icon:"credit-card",   title:"DP booking menunggu pembayaran",desc:"Booking #1042 · Sinta R. · Rp 315.000", time:"1j 40m" },
    { id:"a5", sev:"info",    icon:"message-circle",title:"6 booking baru via WhatsApp",   desc:"Belum dikonfirmasi · butuh review", time:"Hari ini" },
  ];

  // whatsapp / activity feed
  const activity = [
    { id:"f1", time:"09:12", who:"Andi Wijaya",  text:"Booking dikonfirmasi — Honda Brio (3 hari)", kind:"confirmed" },
    { id:"f2", time:"08:47", who:"Bot",          text:"Kirim quote Rp 1.050.000 ke 0812-3456-•••", kind:"bot" },
    { id:"f3", time:"08:40", who:"Sinta Rahayu", text:"Tanya ketersediaan Toyota Avanza", kind:"inbound" },
    { id:"f4", time:"08:05", who:"Dewi A.",      text:"Pembayaran pelunasan diterima — Rp 735.000", kind:"payment" },
    { id:"f5", time:"07:58", who:"Bot",          text:"Reminder H-1 terkirim ke 4 pelanggan", kind:"bot" },
  ];

  // revenue — last 14 days (juta rupiah)
  const revenue14 = [1.8,2.4,1.2,3.1,2.7,2.0,3.4,2.9,1.6,2.2,3.0,2.5,3.6,4.1]
    .map((v,i)=>({ day: i+1, value: v }));

  // fleet status distribution for donut
  const fleetMix = [
    { tone:"available",   label:"Tersedia",  value:12 },
    { tone:"onrent",      label:"Disewa",    value:8  },
    { tone:"maintenance", label:"Servis",    value:3  },
  ];

  // customers
  const customers = [
    { id:"c1", name:"Andi Wijaya",     phone:"0812-3456-7890", city:"Jakarta Selatan", rating:4.5, rentals:12, status:"active",    lastRent:"Hari ini" },
    { id:"c2", name:"Budi Santoso",    phone:"0813-2211-0098", city:"Bekasi Barat",    rating:4.8, rentals:8,  status:"active",    lastRent:"2 hari lalu" },
    { id:"c3", name:"Citra Lestari",   phone:"0856-7788-1234", city:"Depok",           rating:4.2, rentals:5,  status:"active",    lastRent:"5 hari lalu" },
    { id:"c4", name:"Dewi Anggraini",  phone:"0821-9090-4567", city:"Jakarta Timur",   rating:5.0, rentals:3,  status:"verified",  lastRent:"1 minggu lalu" },
    { id:"c5", name:"Eko Prasetyo",    phone:"0877-1234-8765", city:"Tangerang",       rating:3.1, rentals:6,  status:"blacklist", lastRent:"Telat 2 hari" },
    { id:"c6", name:"Fitri Handayani", phone:"0811-5566-3322", city:"Jakarta Pusat",   rating:4.6, rentals:9,  status:"active",    lastRent:"3 hari lalu" },
  ];

  // bookings spread over June 2026 for the calendar (day -> entries)
  const bookings = [
    { day:3,  plate:"B 7788 PQR", vehicle:"Suzuki Ertiga",  customer:"Fitri H.",   status:"AVAILABLE", channel:"wa" },
    { day:6,  plate:"B 1234 XYZ", vehicle:"Toyota Avanza",  customer:"Dewi A.",    status:"BOOKED",    channel:"wa" },
    { day:6,  plate:"B 3344 JKL", vehicle:"Mitsubishi Xpander", customer:"Hadi P.",status:"BOOKED",    channel:"manual" },
    { day:10, plate:"B 5678 ABC", vehicle:"Honda Brio",     customer:"Andi W.",    status:"ON_RENT",   channel:"wa" },
    { day:12, plate:"B 9753 EFG", vehicle:"Toyota Hiace",   customer:"PT Sukses",  status:"BOOKED",    channel:"manual" },
    { day:14, plate:"B 2468 VWX", vehicle:"Toyota Fortuner",customer:"Citra L.",   status:"ON_RENT",   channel:"wa" },
    { day:14, plate:"B 1122 GHI", vehicle:"Toyota Innova",  customer:"Budi S.",    status:"ON_RENT",   channel:"manual" },
    { day:15, plate:"B 5566 MNO", vehicle:"Toyota Avanza",  customer:"Rangga T.",  status:"BOOKED",    channel:"wa" },
    { day:18, plate:"B 9012 DEF", vehicle:"Daihatsu Xenia", customer:"—",          status:"MAINTENANCE",channel:"manual" },
    { day:20, plate:"B 1357 YZA", vehicle:"Daihatsu Terios",customer:"Sinta R.",   status:"BOOKED",    channel:"wa" },
    { day:21, plate:"B 8642 BCD", vehicle:"Wuling Confero", customer:"Joko S.",    status:"BOOKED",    channel:"wa" },
    { day:24, plate:"B 7788 PQR", vehicle:"Suzuki Ertiga",  customer:"Maya L.",    status:"ON_RENT",   channel:"manual" },
    { day:27, plate:"B 1234 XYZ", vehicle:"Toyota Avanza",  customer:"Bayu K.",    status:"BOOKED",    channel:"wa" },
    { day:28, plate:"B 5678 ABC", vehicle:"Honda Brio",     customer:"Andi W.",    status:"BOOKED",    channel:"wa" },
  ];

  // gps live units
  const gpsUnits = [
    { id:"g1", plate:"B 5678 ABC", vehicle:"Honda Brio",     status:"ON_RENT",   driver:"Andi Wijaya",  speed:45, area:"Jl. Sudirman, Jakarta", updated:"2 dtk lalu", x:62, y:38, kmToday:48 },
    { id:"g2", plate:"B 1122 GHI", vehicle:"Toyota Innova",  status:"ON_RENT",   driver:"Budi Santoso", speed:0,  area:"Rest Area KM 19 Tol",   updated:"11 dtk lalu", x:34, y:60, kmToday:112 },
    { id:"g3", plate:"B 2468 VWX", vehicle:"Toyota Fortuner",status:"ON_RENT",   driver:"Citra Lestari",speed:78, area:"Tol Jagorawi",         updated:"4 dtk lalu", x:73, y:66, kmToday:64 },
    { id:"g4", plate:"B 1234 XYZ", vehicle:"Toyota Avanza",  status:"AVAILABLE", driver:null,           speed:0,  area:"Pool Cabang Jakarta",   updated:"30 dtk lalu", x:46, y:30, kmToday:0 },
    { id:"g5", plate:"B 3344 JKL", vehicle:"Mits. Xpander",  status:"AVAILABLE", driver:null,           speed:0,  area:"Pool Cabang Depok",     updated:"45 dtk lalu", x:52, y:78, kmToday:0 },
    { id:"g6", plate:"B 9012 DEF", vehicle:"Daihatsu Xenia", status:"MAINTENANCE",driver:null,          speed:0,  area:"Bengkel Mitra, Bekasi", updated:"1 mnt lalu", x:80, y:24, kmToday:0 },
  ];

  function rupiah(n, opts) {
    opts = opts || {};
    if (opts.short) {
      if (n >= 1e9) return "Rp " + (n/1e9).toFixed(1).replace(".0","") + " M";
      if (n >= 1e6) return "Rp " + (n/1e6).toFixed(1).replace(".0","") + " jt";
      if (n >= 1e3) return "Rp " + Math.round(n/1e3) + "rb";
    }
    return "Rp " + n.toLocaleString("id-ID");
  }

  window.DATA = {
    STATUS, branches, vehicles, summary, activeRentals, alerts, activity,
    revenue14, fleetMix, customers, bookings, gpsUnits, rupiah,
    tenant: { name: "Rajawali Rentcar", plan: "Pro", owner: "Pak Hendra", initials: "RR" },
  };
})();
