/* ============================================================
   Pages — exported to window
   ============================================================ */
/* UI primitives (Icon, Card, Button, …) + hooks come from ui.jsx as globals.
   Do NOT redeclare them here — Babel shares global scope across text/babel scripts. */
const D = window.DATA;
const rp = D.rupiah;

/* ---------------- DASHBOARD ---------------- */
function StatCard({ label, value, sub, icon, tone, spark }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span className={"stat-ico tone-" + tone}>
          <Icon name={icon} size={18} stroke={2.1} />
        </span>
        {spark && <Sparkline data={spark} tone={tone === "primary" ? "primary" : "st-" + tone} />}
      </div>
      <div className="stat-num">{value}</div>
      <div className="stat-meta">
        <span className="stat-label">{label}</span>
        {sub}
      </div>
    </div>
  );
}

function Dashboard() {
  const s = D.summary;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Ringkasan Operasional</h1>
          <p className="page-desc">Sabtu, 14 Juni 2026 · 3 cabang · {s.total} unit armada</p>
        </div>
        <div className="row gap-8">
          <Button variant="ghost" icon="download">Ekspor</Button>
          <Button variant="primary" icon="plus">Booking Baru</Button>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid-stats">
        <StatCard label="Armada siap sewa" value={s.available} icon="circle-check-big" tone="available"
          sub={<span className="delta up"><Icon name="trending-up" size={13} />normal</span>}
          spark={[8,9,7,10,11,10,12]} />
        <StatCard label="Sedang disewa" value={s.onRent} icon="key-round" tone="onrent"
          sub={<span className="muted">{Math.round((s.onRent/s.total)*100)}% utilisasi</span>}
          spark={[5,6,8,7,9,8,8]} />
        <StatCard label="Servis / inspeksi" value={s.maintenance} icon="wrench" tone="maintenance"
          sub={<span className="muted">1 jatuh tempo besok</span>}
          spark={[2,3,2,4,3,3,3]} />
        <StatCard label="Pendapatan bulan ini" value={rp(s.revenueMonth,{short:true})} icon="wallet" tone="primary"
          sub={<span className="delta up"><Icon name="trending-up" size={13} />{s.revenueDelta}%</span>}
          spark={D.revenue14.map(d=>d.value)} />
      </div>

      {/* row: revenue + alerts */}
      <div className="grid-8-4">
        <Card title="Pendapatan" subtitle="14 hari terakhir"
          action={<Segmented value="14d" onChange={()=>{}} options={[
            {value:"14d",label:"14 hari"},{value:"30d",label:"30 hari"},{value:"yr",label:"Tahun"}]} />}>
          <div className="rev-summary">
            <div>
              <span className="rev-big">{rp(s.revenueMonth)}</span>
              <span className="delta up"><Icon name="trending-up" size={14} />{s.revenueDelta}% vs bulan lalu</span>
            </div>
            <div className="rev-legend">
              <span><i className="dot" style={{background:"var(--primary)"}}></i>Realisasi</span>
            </div>
          </div>
          <BarChart data={D.revenue14} height={196} />
        </Card>

        <Card title="Peringatan" subtitle={D.alerts.length + " butuh perhatian"}
          action={<button className="link-btn">Lihat semua</button>} bodyClass="flush">
          <ul className="alert-list">
            {D.alerts.map((a) => (
              <li className={"alert sev-" + a.sev} key={a.id}>
                <span className="alert-ico"><Icon name={a.icon} size={16} /></span>
                <div className="alert-body">
                  <p className="alert-title">{a.title}</p>
                  <p className="alert-desc">{a.desc}</p>
                </div>
                <span className="alert-time">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* row: active rentals + fleet mix */}
      <div className="grid-8-4">
        <Card title="Sewa Aktif" subtitle="Unit yang sedang di jalan"
          action={<button className="link-btn">Buka semua</button>} bodyClass="flush">
          <table className="tbl">
            <thead>
              <tr>
                <th>Kendaraan</th><th>Pelanggan</th><th>Cabang</th>
                <th>Jatuh tempo</th><th className="w-progress">Progress</th><th></th>
              </tr>
            </thead>
            <tbody>
              {D.activeRentals.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="cell-veh">
                      <span className="plate">{r.plate}</span>
                      <span className="veh-name">{r.vehicle}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-cust">
                      <Avatar name={r.customer} size={26} />
                      <span>{r.customer}</span>
                      {r.channel === "wa" && <Icon name="message-circle" size={13} className="wa-mini" />}
                    </div>
                  </td>
                  <td className="muted">{r.branch}</td>
                  <td>
                    <span className={r.overdue ? "due overdue" : "due"}>
                      {r.overdue && <Icon name="alarm-clock" size={13} />}
                      {r.due}
                    </span>
                  </td>
                  <td>
                    <div className="progress">
                      <div className={"progress-bar" + (r.overdue ? " is-over" : "")} style={{ width: r.progress + "%" }}></div>
                    </div>
                  </td>
                  <td className="ta-right">
                    <button className="icon-btn"><Icon name="ellipsis" size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="stack-12">
          <Card title="Komposisi Armada">
            <div className="mix">
              <Donut data={D.fleetMix} />
              <ul className="mix-legend">
                {D.fleetMix.map((m) => (
                  <li key={m.tone}>
                    <i className="dot" style={{ background: `var(--st-${m.tone})` }}></i>
                    <span className="mix-label">{m.label}</span>
                    <span className="mix-val">{m.value}</span>
                  </li>
                ))}
                <li className="mix-foot">
                  <span className="mix-label">Utilisasi</span>
                  <span className="mix-val accent">{D.summary.utilization}%</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card title="Aktivitas WhatsApp" subtitle={D.summary.waShare + "% booking via WA"} bodyClass="flush">
            <ul className="feed">
              {D.activity.map((f) => (
                <li className="feed-item" key={f.id}>
                  <span className={"feed-ico k-" + f.kind}>
                    <Icon name={f.kind === "bot" ? "bot" : f.kind === "payment" ? "banknote" : f.kind === "confirmed" ? "check" : "message-circle"} size={14} />
                  </span>
                  <div className="feed-body">
                    <p className="feed-text"><b>{f.who}</b> {f.text}</p>
                    <span className="feed-time">{f.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------- ARMADA (FLEET) ---------------- */
function Fleet() {
  const [view, setView] = useState("table");
  const [q, setQ] = useState("");
  const [branch, setBranch] = useState("all");
  const [status, setStatus] = useState("all");
  const branchName = (id) => (D.branches.find((b) => b.id === id) || {}).short || id;

  let rows = D.vehicles.filter((v) => {
    if (branch !== "all" && v.branch !== branch) return false;
    if (status !== "all" && v.status !== status) return false;
    if (q && !(`${v.merk} ${v.model} ${v.plate}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Armada</h1>
          <p className="page-desc">{D.summary.total} unit · 3 cabang</p>
        </div>
        <div className="row gap-8">
          <Button variant="ghost" icon="arrow-left-right">Transfer</Button>
          <Button variant="primary" icon="plus">Tambah Kendaraan</Button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={16} />
          <input placeholder="Cari merk, model, atau plat…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="all">Semua cabang</option>
          {D.branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Semua status</option>
          {Object.values(D.STATUS).map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <div className="spacer"></div>
        <Segmented value={view} onChange={setView} options={[
          { value: "table", icon: "list" }, { value: "grid", icon: "layout-grid" }]} />
      </div>

      {view === "table" ? (
        <Card pad={false}>
          <table className="tbl tbl-lg">
            <thead>
              <tr>
                <th className="w-idx">#</th><th>Kendaraan</th><th>Plat</th>
                <th>Cabang</th><th>Tarif / hari</th><th>Odometer</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v, i) => (
                <tr key={v.id}>
                  <td className="muted">{i + 1}</td>
                  <td>
                    <div className="cell-veh-img">
                      <span className="veh-thumb"><Icon name="car-front" size={18} /></span>
                      <div>
                        <span className="veh-name">{v.merk} {v.model}</span>
                        <span className="veh-sub">{v.year} · {v.color}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="plate">{v.plate}</span></td>
                  <td className="muted">{branchName(v.branch)}</td>
                  <td className="num">{rp(v.day)}</td>
                  <td className="num muted">{v.odo.toLocaleString("id-ID")} km</td>
                  <td><StatusBadge status={v.status} /></td>
                  <td className="ta-right">
                    <div className="row-actions">
                      <button className="icon-btn" title="Lihat"><Icon name="eye" size={16} /></button>
                      <button className="icon-btn" title="Edit"><Icon name="pencil" size={15} /></button>
                      <button className="icon-btn" title="Lainnya"><Icon name="ellipsis" size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="tbl-foot">
            <span className="muted">Menampilkan {rows.length} dari {D.summary.total} kendaraan</span>
            <div className="pager">
              <button className="icon-btn"><Icon name="chevron-left" size={16} /></button>
              <button className="page-num is-on">1</button>
              <button className="page-num">2</button>
              <button className="page-num">3</button>
              <span className="muted">…</span>
              <button className="page-num">8</button>
              <button className="icon-btn"><Icon name="chevron-right" size={16} /></button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="fleet-grid">
          {rows.map((v) => (
            <div className="vcard" key={v.id}>
              <div className="vcard-img">
                <image-slot id={"veh-" + v.id} shape="rect" placeholder={"Foto " + v.model}
                  style={{ width: "100%", height: "100%" }}></image-slot>
                <span className="vcard-status"><StatusBadge status={v.status} /></span>
              </div>
              <div className="vcard-body">
                <div className="vcard-row">
                  <span className="veh-name">{v.merk} {v.model}</span>
                  <span className="plate">{v.plate}</span>
                </div>
                <div className="vcard-meta">
                  <span><Icon name="map-pin" size={13} />{branchName(v.branch)}</span>
                  <span><Icon name="calendar" size={13} />{v.year}</span>
                </div>
                <div className="vcard-foot">
                  <span className="num accent">{rp(v.day)}<small>/hari</small></span>
                  <button className="icon-btn"><Icon name="arrow-right" size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.Pages = { Dashboard, Fleet };
