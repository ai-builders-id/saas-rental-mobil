/* ============================================================
   Pages (more): Booking, Pelanggan, GPS, EmptyState
   ============================================================ */
const { Icon: Ic, StatusBadge: SB, Badge: Bd, Card: Cd, Button: Bt, Segmented: Sg, Avatar: Av, Rating: Rt } = window;
const DT = window.DATA;
const rup = DT.rupiah;

/* ---------------- BOOKING CALENDAR ---------------- */
function Bookings() {
  const daysInMonth = 30; // June 2026
  const firstDow = 0; // Sun=0 → 1 Jun 2026 is a Monday actually; keep simple: start Sunday col
  // 1 June 2026 is Monday → offset 1
  const offset = 1;
  const byDay = {};
  DT.bookings.forEach((b) => { (byDay[b.day] = byDay[b.day] || []).push(b); });
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dow = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const toneOf = (s) => (DT.STATUS[s] || {}).tone || "inspection";

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Kalender Booking</h1>
          <p className="page-desc">Juni 2026 · {DT.bookings.length} jadwal</p>
        </div>
        <div className="row gap-8">
          <Sg value="month" onChange={() => {}} options={[
            { value: "month", label: "Bulan" }, { value: "week", label: "Minggu" }]} />
          <Bt variant="primary" icon="plus">Booking Baru</Bt>
        </div>
      </div>

      <Cd pad={false}>
        <div className="cal-head">
          <div className="row gap-8 ai-center">
            <button className="icon-btn"><Ic name="chevron-left" size={18} /></button>
            <strong className="cal-month">Juni 2026</strong>
            <button className="icon-btn"><Ic name="chevron-right" size={18} /></button>
            <button className="link-btn">Hari ini</button>
          </div>
          <div className="cal-legend">
            {[["available", "Tersedia"], ["booked", "Dibooking"], ["onrent", "Disewa"], ["maintenance", "Servis"]].map(([t, l]) => (
              <span key={t}><i className="dot" style={{ background: `var(--st-${t})` }}></i>{l}</span>
            ))}
          </div>
        </div>

        <div className="cal-grid">
          {dow.map((d) => <div className="cal-dow" key={d}>{d}</div>)}
          {cells.map((d, i) => (
            <div className={"cal-cell" + (d === 14 ? " is-today" : "") + (d === null ? " is-empty" : "")} key={i}>
              {d && (
                <>
                  <span className="cal-date">{d}</span>
                  <div className="cal-events">
                    {(byDay[d] || []).slice(0, 3).map((b, j) => (
                      <div className={"cal-chip tone-" + toneOf(b.status)} key={j} title={`${b.plate} · ${b.customer}`}>
                        {b.channel === "wa" && <Ic name="message-circle" size={11} />}
                        <span className="cal-chip-plate">{b.plate.replace("B ", "")}</span>
                        <span className="cal-chip-cust">{b.customer}</span>
                      </div>
                    ))}
                    {(byDay[d] || []).length > 3 && <span className="cal-more">+{byDay[d].length - 3} lagi</span>}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </Cd>
    </div>
  );
}

/* ---------------- PELANGGAN ---------------- */
function Customers() {
  const [q, setQ] = React.useState("");
  const statusBadge = (s) => {
    if (s === "blacklist") return <Bd tone="maintenance">Blacklist</Bd>;
    if (s === "verified") return <Bd tone="available">Terverifikasi</Bd>;
    return <Bd tone="booked">Aktif</Bd>;
  };
  const rows = DT.customers.filter((c) => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q));
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pelanggan</h1>
          <p className="page-desc">{DT.customers.length} pelanggan terdaftar</p>
        </div>
        <Bt variant="primary" icon="user-plus">Tambah Pelanggan</Bt>
      </div>

      <div className="toolbar">
        <div className="search">
          <Ic name="search" size={16} />
          <input placeholder="Cari nama atau nomor HP…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select"><option>Semua status</option><option>Aktif</option><option>Blacklist</option></select>
        <div className="spacer"></div>
        <Bt variant="ghost" icon="download" size="sm">Ekspor</Bt>
      </div>

      <Cd pad={false}>
        <table className="tbl tbl-lg">
          <thead>
            <tr><th>Pelanggan</th><th>Kontak</th><th>Kota</th><th>Rating</th><th>Total Sewa</th><th>Status</th><th>Terakhir</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="cell-cust">
                    <Av name={c.name} size={32} />
                    <span className="veh-name">{c.name}</span>
                  </div>
                </td>
                <td className="num muted">{c.phone}</td>
                <td className="muted">{c.city}</td>
                <td><Rt value={c.rating} /></td>
                <td className="num">{c.rentals}×</td>
                <td>{statusBadge(c.status)}</td>
                <td className="muted">{c.lastRent}</td>
                <td className="ta-right"><button className="icon-btn"><Ic name="chevron-right" size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Cd>
    </div>
  );
}

/* ---------------- GPS LIVE ---------------- */
function Gps() {
  const [sel, setSel] = React.useState(DT.gpsUnits[0].id);
  const unit = DT.gpsUnits.find((u) => u.id === sel);
  const toneOf = (s) => (DT.STATUS[s] || {}).tone || "inspection";
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">GPS Live Tracking</h1>
          <p className="page-desc">{DT.gpsUnits.length} unit termonitor · update tiap 30 dtk</p>
        </div>
        <div className="row gap-8">
          <Bt variant="ghost" icon="locate-fixed">Geofence</Bt>
          <Bt variant="ghost" icon="history">Riwayat</Bt>
        </div>
      </div>

      <div className="gps-layout">
        <Cd pad={false} className="gps-map-card">
          <div className="gps-map">
            <div className="gps-map-ph">
              <div className="gps-grid-lines"></div>
              <span className="gps-ph-label">PETA GPS · Google Maps JS API</span>
            </div>
            {DT.gpsUnits.map((u) => (
              <button
                key={u.id}
                className={"gps-pin tone-" + toneOf(u.status) + (u.id === sel ? " is-sel" : "")}
                style={{ left: u.x + "%", top: u.y + "%" }}
                onClick={() => setSel(u.id)}
                title={u.plate}
              >
                <Ic name="navigation" size={13} />
                <span className="gps-pin-label">{u.plate.replace("B ", "")}</span>
              </button>
            ))}
            <div className="gps-zoom">
              <button className="icon-btn"><Ic name="plus" size={16} /></button>
              <button className="icon-btn"><Ic name="minus" size={16} /></button>
            </div>
          </div>
        </Cd>

        <div className="gps-side">
          <Cd title="Unit Aktif" bodyClass="flush">
            <ul className="gps-list">
              {DT.gpsUnits.map((u) => (
                <li key={u.id} className={"gps-row" + (u.id === sel ? " is-sel" : "")} onClick={() => setSel(u.id)}>
                  <span className={"gps-dot tone-" + toneOf(u.status)}></span>
                  <div className="gps-row-body">
                    <span className="plate">{u.plate}</span>
                    <span className="gps-row-sub">{u.vehicle} · {u.area}</span>
                  </div>
                  <span className="gps-speed">{u.speed}<small> km/j</small></span>
                </li>
              ))}
            </ul>
          </Cd>

          {unit && (
            <Cd title="Detail Unit">
              <div className="gps-detail-head">
                <div>
                  <span className="plate lg">{unit.plate}</span>
                  <span className="veh-sub">{unit.vehicle}</span>
                </div>
                <SB status={unit.status} />
              </div>
              <dl className="kv">
                <div><dt>Pengemudi</dt><dd>{unit.driver || "—"}</dd></div>
                <div><dt>Lokasi</dt><dd>{unit.area}</dd></div>
                <div><dt>Kecepatan</dt><dd className="num">{unit.speed} km/j</dd></div>
                <div><dt>Jarak hari ini</dt><dd className="num">{unit.kmToday} km</dd></div>
                <div><dt>Update terakhir</dt><dd className="muted">{unit.updated}</dd></div>
              </dl>
              <div className="row gap-8">
                <Bt variant="default" icon="route" size="sm">Riwayat Rute</Bt>
                <Bt variant="ghost" icon="bell" size="sm">Notifikasi</Bt>
              </div>
            </Cd>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- EMPTY STATE ---------------- */
function EmptyState({ icon, title, desc }) {
  return (
    <div className="page">
      <div className="empty">
        <span className="empty-ico"><Ic name={icon} size={26} /></span>
        <h2>{title}</h2>
        <p>{desc}</p>
        <div className="row gap-8">
          <Bt variant="primary" icon="sparkles">Lihat pratinjau</Bt>
          <Bt variant="ghost">Pelajari</Bt>
        </div>
      </div>
    </div>
  );
}

Object.assign(window.Pages, { Bookings, Customers, Gps, EmptyState });
